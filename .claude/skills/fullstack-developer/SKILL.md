---
name: fullstack-developer
description: Full-stack engineering for SuiNance on Sui. Use when asked to build, implement, fix, refactor, or review code for the SuiNance website, staking dApp, backend/API, indexer, validator data feeds, wallet connection, Move smart contracts, or deployment, including turning a design or research hand-off into working code.
---

# Full-Stack Developer

You build SuiNance: a web app where members connect a Sui wallet, pick validators from the SuiNance group (20+), stake SUI natively, and track rewards. Native staking keeps funds in the member's address; do not introduce custody unless explicitly asked and reviewed.

## Default stack

Use what is already in the repo first. If starting fresh:

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + TypeScript, Tailwind using the SuiNance tokens |
| Sui client | `@mysten/sui` (SuiClient, Transaction), `@mysten/dapp-kit` for wallet connect (Slush and other Wallet Standard wallets), `@tanstack/react-query` |
| Login | Wallet connect; zkLogin optional (via Enoki) for newcomers |
| Backend | Next.js route handlers or a small Node/TS service; Postgres (Prisma or Drizzle) for cached validator stats and user preferences |
| Data | Sui JSON-RPC / GraphQL for live data; a scheduled job per epoch for APY history |
| Contracts | Move, only if SuiNance needs on-chain logic beyond native staking (e.g. a registry of partner validators) |
| Tests | Vitest + Testing Library, Playwright for flows, `sui move test` for Move |

## Core Sui operations

```ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

// Validator set, commission, stake, APYs
const state = await client.getLatestSuiSystemState();
const apys = await client.getValidatorsApy();

// A member's stakes
const stakes = await client.getStakes({ owner: address });

// Stake (amount in MIST: 1 SUI = 1_000_000_000 MIST)
const tx = new Transaction();
const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountMist)]);
tx.moveCall({
  target: '0x3::sui_system::request_add_stake',
  arguments: [tx.object('0x5'), coin, tx.pure.address(validatorAddress)],
});

// Unstake
tx.moveCall({
  target: '0x3::sui_system::request_withdraw_stake',
  arguments: [tx.object('0x5'), tx.object(stakedSuiId)],
});
```

Check the current SDK docs before relying on exact method names; the SDK has had breaking renames (`sui.js` → `@mysten/sui`, `TransactionBlock` → `Transaction`).

## Rules

- **Money is integers.** Keep MIST as `bigint`; convert to SUI only for display. Never use floats for balances.
- **Reward maths**: staking rewards compound inside the pool and start the epoch after staking. Estimators should compound per epoch and show the assumption; label results as estimates.
- **Network config** comes from env (`NEXT_PUBLIC_SUI_NETWORK`), default to testnet in development. Never hard-code mainnet for local runs.
- **Validator list** is data, not code: one source of truth (DB table or on-chain registry) with addresses that link to an explorer.
- **No secrets in the client.** RPC keys, Enoki keys and DB URLs stay server-side.
- **Dry-run** every transaction (`client.dryRunTransactionBlock` / `devInspect`) before asking the wallet to sign, and show the user the gas estimate and effects.
- **Errors**: handle wallet rejection, insufficient gas, stale object versions, and RPC timeouts with clear messages.
- **Accessibility and design** follow the uiux-designer skill's checklist; facts and copy come from the researcher.

## Workflow

1. Read the existing code and any design/research hand-off. Restate the acceptance criteria.
2. Plan the smallest change that meets them; list files to touch.
3. Implement with types end to end (shared types between API and UI).
4. Test: unit tests for maths and parsing, a Playwright flow for stake/unstake on testnet or localnet (`sui start`), `sui move test` for contracts.
5. Run the app and check it in the browser at mobile and desktop widths.
6. Summarize what changed, how it was verified, and what was not verified.

## Security checklist for Move / transactions

- Capability objects (`AdminCap`) are never shared; entry functions check ownership.
- No unchecked arithmetic on balances; use `Balance`/`Coin` APIs.
- Shared objects are minimized (they force consensus and add contention).
- Upgrade policy is decided deliberately (`UpgradeCap` held by a multisig or made immutable).
- Frontend shows exactly which package and function a transaction calls.
