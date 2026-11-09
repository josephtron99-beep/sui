import "server-only";
import { isPartner } from "@/config/validators";

const GRAPHQL_URL = process.env.SUI_GRAPHQL_URL ?? "https://graphql.mainnet.sui.io/graphql";
const MIST = 1e9;
const EPOCHS_PER_YEAR = 365;

export type Validator = {
  address: string;
  name: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  commissionPct: number;
  stakeSui: number;
  votingPowerPct: number;
  gasPrice: number;
  apyPct: number;
  atRisk: boolean;
  partner: boolean;
  activationEpoch: number;
  stakingPoolId: string;
  /** Values already scheduled for the next epoch. */
  nextCommissionPct: number;
  nextGasPrice: number;
  nextStakeSui: number;
  pendingStakeSui: number;
  pendingWithdrawSui: number;
  /** Validators that reported this one under the tallying rule this epoch. */
  reportedBy: string[];
  /** Host part of the validator's network address, e.g. "sui.example.com". */
  host: string;
};

export type NetworkSnapshot = {
  epoch: number;
  epochStart: string;
  referenceGasPrice: number;
  totalStakeSui: number;
  validatorCount: number;
  lastEpochRewardsSui: number;
  lastEpochTransactions: number;
  networkApyPct: number;
  validators: Validator[];
  fetchedAt: string;
};

type MoveValidator = {
  metadata: { sui_address: string; name: string; description: string; image_url: string; project_url: string; net_address: string };
  voting_power: string;
  gas_price: string;
  commission_rate: string;
  next_epoch_commission_rate: string;
  next_epoch_gas_price: string;
  next_epoch_stake: string;
  staking_pool: {
    id: string;
    sui_balance: string;
    activation_epoch: string | null;
    pending_stake: string;
    pending_total_sui_withdraw: string;
  };
};

/** "/dns/sui.example.com/tcp/8080/http" → "sui.example.com" */
function hostOf(multiaddr: string) {
  const parts = (multiaddr ?? "").split("/");
  return parts.length > 2 ? parts[2] : "";
}

/** Smallest number of validators that together hold more than one third of voting power (can halt the network). */
export function nakamotoCoefficient(validators: Validator[]) {
  const sorted = [...validators].sort((a, b) => b.votingPowerPct - a.votingPowerPct);
  let sum = 0;
  for (let i = 0; i < sorted.length; i++) {
    sum += sorted[i].votingPowerPct;
    if (sum > 100 / 3) return i + 1;
  }
  return sorted.length;
}

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Sui GraphQL ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

const EPOCH_QUERY = /* GraphQL */ `
  query Epoch($after: String) {
    epoch {
      epochId
      startTimestamp
      referenceGasPrice
      validatorSet {
        activeValidators(first: 50, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes { atRisk contents { json } reportRecords(first: 50) { nodes { contents { json } } } }
        }
      }
    }
  }
`;

const PREV_EPOCH_QUERY = /* GraphQL */ `
  query Prev($id: UInt53!) {
    epoch(epochId: $id) { totalStakeRewards totalTransactions }
  }
`;

type EpochData = {
  epoch: {
    epochId: number;
    startTimestamp: string;
    referenceGasPrice: string;
    validatorSet: {
      activeValidators: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: { atRisk: number | null; contents: { json: MoveValidator }; reportRecords: { nodes: { contents: { json: MoveValidator } }[] } | null }[];
      };
    };
  };
};

export async function getNetworkSnapshot(): Promise<NetworkSnapshot> {
  const raw: { atRisk: number | null; v: MoveValidator; reportedBy: string[] }[] = [];
  let after: string | null = null;
  let head: EpochData["epoch"] | null = null;

  for (let page = 0; page < 8; page++) {
    const data: EpochData = await gql<EpochData>(EPOCH_QUERY, { after });
    head = data.epoch;
    const conn = data.epoch.validatorSet.activeValidators;
    raw.push(
      ...conn.nodes.map((n) => ({
        atRisk: n.atRisk,
        v: n.contents.json,
        reportedBy: (n.reportRecords?.nodes ?? []).map((r) => r.contents.json.metadata.name),
      })),
    );
    if (!conn.pageInfo.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  if (!head) throw new Error("No epoch data");

  const prev = await gql<{ epoch: { totalStakeRewards: string | null; totalTransactions: number | null } | null }>(
    PREV_EPOCH_QUERY,
    { id: head.epochId - 1 },
  );

  const totalStakeSui = raw.reduce((s, r) => s + Number(r.v.staking_pool.sui_balance) / MIST, 0);
  const lastEpochRewardsSui = Number(prev.epoch?.totalStakeRewards ?? 0) / MIST;
  const grossApy = totalStakeSui > 0 ? (lastEpochRewardsSui / totalStakeSui) * EPOCHS_PER_YEAR * 100 : 0;

  const validators: Validator[] = raw
    .map(({ atRisk, v, reportedBy }) => {
      const commissionPct = Number(v.commission_rate) / 100;
      return {
        address: v.metadata.sui_address,
        name: v.metadata.name,
        description: v.metadata.description,
        imageUrl: v.metadata.image_url,
        projectUrl: v.metadata.project_url,
        commissionPct,
        stakeSui: Number(v.staking_pool.sui_balance) / MIST,
        votingPowerPct: Number(v.voting_power) / 100,
        gasPrice: Number(v.gas_price),
        apyPct: grossApy * (1 - commissionPct / 100),
        atRisk: Boolean(atRisk && atRisk > 0),
        partner: isPartner(v.metadata.sui_address),
        activationEpoch: Number(v.staking_pool.activation_epoch ?? 0),
        stakingPoolId: v.staking_pool.id,
        nextCommissionPct: Number(v.next_epoch_commission_rate) / 100,
        nextGasPrice: Number(v.next_epoch_gas_price),
        nextStakeSui: Number(v.next_epoch_stake) / MIST,
        pendingStakeSui: Number(v.staking_pool.pending_stake) / MIST,
        pendingWithdrawSui: Number(v.staking_pool.pending_total_sui_withdraw) / MIST,
        reportedBy,
        host: hostOf(v.metadata.net_address),
      };
    })
    .sort((a, b) => b.stakeSui - a.stakeSui);

  const avgCommission = validators.reduce((s, v) => s + v.commissionPct * v.stakeSui, 0) / (totalStakeSui || 1);

  return {
    epoch: head.epochId,
    epochStart: head.startTimestamp,
    referenceGasPrice: Number(head.referenceGasPrice),
    totalStakeSui,
    validatorCount: validators.length,
    lastEpochRewardsSui,
    lastEpochTransactions: prev.epoch?.totalTransactions ?? 0,
    networkApyPct: grossApy * (1 - avgCommission / 100),
    validators,
    fetchedAt: new Date().toISOString(),
  };
}

/** Never throws: pages render a clear "data unavailable" state instead. */
export async function safeNetworkSnapshot(): Promise<NetworkSnapshot | null> {
  try {
    return await getNetworkSnapshot();
  } catch (e) {
    console.error("[sui] network snapshot failed", e);
    return null;
  }
}
