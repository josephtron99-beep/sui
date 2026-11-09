"use client";

import { useCurrentAccount, useCurrentClient, useDAppKit, useWalletConnection, useWallets } from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";
import type { SuiGrpcClient } from "@mysten/sui/grpc";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, ExternalLink, Loader2, LogOut, Wallet, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { NetworkSnapshot, Validator } from "@/lib/sui/network";
import { Button, buttonClasses } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form";
import { Badge } from "@/components/ui/primitives";
import { cn, formatNumber, mistToSui, shortAddress, suiToMist } from "@/lib/utils";

const MIN_STAKE_MIST = 1_000_000_000n;
const GAS_BUFFER_MIST = 50_000_000n;
const SUI_SYSTEM_STATE = "0x5";

type StakeObj = { id: string; poolId: string; principalMist: bigint; activationEpoch: number };

type WalletClient = SuiGrpcClient;

async function loadWallet(client: WalletClient, owner: string): Promise<{ balance: bigint; stakes: StakeObj[] }> {
  const [{ balance: b }, owned] = await Promise.all([
    client.getBalance({ owner }),
    client.listOwnedObjects({ owner, type: "0x3::staking_pool::StakedSui", include: { json: true }, limit: 50 }),
  ]);
  return {
    balance: BigInt(b.balance),
    stakes: owned.objects.map((o) => {
      const j = (o.json ?? {}) as { pool_id?: string; principal?: string | { value?: string }; stake_activation_epoch?: string };
      const principal = typeof j.principal === "object" ? j.principal?.value : j.principal;
      return {
        id: o.objectId,
        poolId: String(j.pool_id ?? ""),
        principalMist: BigInt(principal ?? "0"),
        activationEpoch: Number(j.stake_activation_epoch ?? 0),
      };
    }),
  };
}

function explorerTx(digest: string) {
  return `https://suiscan.xyz/mainnet/tx/${digest}`;
}

/* ─────────── Wallet picker ─────────── */
function ConnectPanel() {
  const wallets = useWallets();
  const dAppKit = useDAppKit();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-bold">Connect a Sui wallet</h2>
      <p className="text-[15px] text-muted">Suinance never asks for your seed phrase. You approve every action in your own wallet.</p>
      {wallets.length === 0 ? (
        <div className="grid gap-3 rounded-xl border border-dashed border-ink/30 p-5 text-[15px]">
          <p>No Sui wallet was found in this browser.</p>
          <a href="https://slush.app" target="_blank" rel="noopener noreferrer" className={buttonClasses("outline", "md", "w-fit")}>
            Get Slush wallet <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>
      ) : (
        <ul className="grid gap-2">
          {wallets.map((w) => (
            <li key={w.name}>
              <button
                type="button"
                disabled={!!busy}
                onClick={async () => {
                  setError(null);
                  setBusy(w.name);
                  try {
                    await dAppKit.connectWallet({ wallet: w });
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Could not connect to the wallet.");
                  } finally {
                    setBusy(null);
                  }
                }}
                className="flex w-full items-center gap-3 rounded-xl border-[1.5px] border-line px-4 py-3 text-left transition hover:border-ink hover:bg-yellow-wash disabled:opacity-60"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {w.icon && <img src={w.icon} alt="" className="h-8 w-8 rounded-lg" />}
                <span className="flex-1 font-medium">{w.name}</span>
                {busy === w.name && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <FormAlert>{error}</FormAlert>}
    </div>
  );
}

/* ─────────── Validator select ─────────── */
function ValidatorSelect({ validators, value, onChange }: { validators: Validator[]; value: Validator | null; onChange: (v: Validator) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const sorted = [...validators].sort((a, b) => Number(b.partner) - Number(a.partner) || b.apyPct - a.apyPct);
    return t ? sorted.filter((v) => v.name.toLowerCase().includes(t)) : sorted;
  }, [validators, q]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-14 w-full items-center justify-between gap-3 rounded-xl border-[1.5px] border-ink bg-paper px-4 text-left"
      >
        {value ? (
          <span className="grid">
            <span className="font-medium">{value.name}</span>
            <span className="font-mono text-[12px] text-muted">
              {formatNumber(value.commissionPct, 2)}% commission · est. {formatNumber(value.apyPct, 2)}%
            </span>
          </span>
        ) : (
          <span className="text-muted">Choose a validator</span>
        )}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border-[1.5px] border-ink bg-paper shadow-soft"
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search validators"
              aria-label="Search validators"
              className="h-11 w-full border-b border-line px-4 text-[15px] outline-none"
            />
            <ul role="listbox" className="max-h-72 overflow-y-auto" data-lenis-prevent>
              {list.map((v) => (
                <li key={v.address} role="option" aria-selected={value?.address === v.address}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(v);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[15px] hover:bg-yellow-wash"
                  >
                    <span className="flex items-center gap-2">
                      {v.name}
                      {v.partner && <Badge tone="yellow">Partner</Badge>}
                    </span>
                    <span className="font-mono text-[12px] text-muted">{formatNumber(v.apyPct, 2)}%</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────── Main app ─────────── */
export function StakeApp() {
  const account = useCurrentAccount();
  const connection = useWalletConnection();
  const client = useCurrentClient();
  const dAppKit = useDAppKit();
  const params = useSearchParams();

  const [snap, setSnap] = useState<NetworkSnapshot | null>(null);
  const [snapError, setSnapError] = useState(false);
  const [validator, setValidator] = useState<Validator | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [stakes, setStakes] = useState<StakeObj[]>([]);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string; digest?: string } | null>(null);

  useEffect(() => {
    fetch("/api/network")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: NetworkSnapshot) => {
        setSnap(d);
        const wanted = params.get("validator");
        const fromQuery = wanted ? d.validators.find((v) => v.address.toLowerCase() === wanted.toLowerCase()) : undefined;
        setValidator(fromQuery ?? null);
      })
      .catch(() => setSnapError(true));
  }, [params]);

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  const [lastAccount, setLastAccount] = useState(account?.address);
  if (lastAccount !== account?.address) {
    setLastAccount(account?.address);
    setBalance(null);
    setStakes([]);
  }

  useEffect(() => {
    if (!account) return;
    let alive = true;
    loadWallet(client, account.address)
      .then((d) => {
        if (!alive) return;
        setBalance(d.balance);
        setStakes(d.stakes);
      })
      .catch((e) => console.error(e));
    return () => {
      alive = false;
    };
  }, [account, client, reloadKey]);

  const poolToValidator = useMemo(() => new Map(snap?.validators.map((v) => [v.stakingPoolId, v]) ?? []), [snap]);

  let amountMist: bigint | null = null;
  let amountError: string | null = null;
  if (amount) {
    try {
      amountMist = suiToMist(amount);
      if (amountMist < MIN_STAKE_MIST) amountError = "The minimum stake on Sui is 1 SUI.";
      else if (balance !== null && amountMist + GAS_BUFFER_MIST > balance) amountError = "Not enough SUI left for gas. Lower the amount.";
    } catch {
      amountError = "Enter a valid amount, for example 25 or 25.5";
    }
  }

  const run = async (label: string, build: (tx: Transaction) => void, success: string) => {
    setNotice(null);
    setBusy(label);
    try {
      const tx = new Transaction();
      build(tx);
      const res = await dAppKit.signAndExecuteTransaction({ transaction: tx });
      const t = res.Transaction ?? res.FailedTransaction;
      if (res.$kind === "FailedTransaction" || !t?.status.success) {
        setNotice({ tone: "danger", text: "The transaction failed on-chain. No SUI was staked.", digest: t?.digest });
      } else {
        setNotice({ tone: "success", text: success, digest: t.digest });
        setAmount("");
        await client.waitForTransaction({ digest: t.digest }).catch(() => undefined);
        refresh();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setNotice({ tone: "danger", text: /reject/i.test(msg) ? "You rejected the request in your wallet." : msg });
    } finally {
      setBusy(null);
    }
  };

  const stake = () => {
    if (!validator || !amountMist || amountError) return;
    const mist = amountMist;
    run(
      "stake",
      (tx) => {
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(mist)]);
        tx.moveCall({ target: "0x3::sui_system::request_add_stake", arguments: [tx.object(SUI_SYSTEM_STATE), coin, tx.pure.address(validator.address)] });
      },
      `Staked ${formatNumber(mistToSui(mist), 2)} SUI with ${validator.name}. It becomes active next epoch.`,
    );
  };

  const unstake = (s: StakeObj) =>
    run(
      s.id,
      (tx) => {
        tx.moveCall({ target: "0x3::sui_system::request_withdraw_stake", arguments: [tx.object(SUI_SYSTEM_STATE), tx.object(s.id)] });
      },
      "Unstaked. Your SUI and earned rewards are back in your wallet.",
    );

  const totalStaked = stakes.reduce((s, x) => s + x.principalMist, 0n);
  const maxMist = balance !== null && balance > GAS_BUFFER_MIST ? balance - GAS_BUFFER_MIST : 0n;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      {/* Stake form */}
      <div className="grid content-start gap-6 rounded-card border-[1.5px] border-ink bg-paper p-6 shadow-hard sm:p-8">
        {!account ? (
          connection.isConnecting || connection.isReconnecting ? (
            <div className="flex items-center gap-3 text-muted">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Connecting wallet…
            </div>
          ) : (
            <ConnectPanel />
          )
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-yellow">
                  <Wallet className="h-4.5 w-4.5" aria-hidden />
                </span>
                <div className="grid">
                  <span className="font-mono text-sm">{shortAddress(account.address, 8)}</span>
                  <span className="text-[13px] text-muted">
                    {balance === null ? "Loading balance…" : `${formatNumber(mistToSui(balance), 4)} SUI available`}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => dAppKit.disconnectWallet()} className={buttonClasses("ghost", "sm")}>
                <LogOut className="h-4 w-4" aria-hidden /> Disconnect
              </button>
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium">Validator</span>
              {snap ? (
                <ValidatorSelect validators={snap.validators} value={validator} onChange={setValidator} />
              ) : snapError ? (
                <FormAlert>Validator list is unavailable right now. Please refresh in a minute.</FormAlert>
              ) : (
                <div className="h-14 animate-pulse rounded-xl bg-line" />
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="stake-amount" className="flex justify-between text-sm font-medium">
                Amount
                <button type="button" onClick={() => setAmount(maxMist > 0n ? String(mistToSui(maxMist).toFixed(4)) : "")} className="font-mono text-[12px] uppercase tracking-wider text-muted hover:text-ink">
                  Max
                </button>
              </label>
              <div className="relative">
                <input
                  id="stake-amount"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                  aria-invalid={!!amountError || undefined}
                  className="h-16 w-full rounded-xl border-[1.5px] border-ink bg-paper pl-4 pr-16 font-display text-3xl font-bold outline-none focus:shadow-[0_0_0_4px_var(--yellow-soft)]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">SUI</span>
              </div>
              {amountError && <p className="text-[13px] text-danger">{amountError}</p>}
            </div>

            {validator && amountMist && !amountError && (
              <div className="rounded-xl bg-yellow-wash p-4 text-[14px]">
                Estimated yearly rewards:{" "}
                <strong className="font-mono">{formatNumber((mistToSui(amountMist) * validator.apyPct) / 100, 2)} SUI</strong> at today&apos;s rate.
                Your stake becomes active next epoch.
              </div>
            )}

            <Button size="lg" onClick={stake} disabled={!validator || !amountMist || !!amountError} loading={busy === "stake"} className="w-full">
              {busy === "stake" ? "Confirm in your wallet…" : "Stake SUI"}
            </Button>
          </>
        )}

        <AnimatePresence>
          {notice && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <FormAlert tone={notice.tone}>
                <span className="flex items-start justify-between gap-3">
                  <span>
                    {notice.text}{" "}
                    {notice.digest && (
                      <a href={explorerTx(notice.digest)} target="_blank" rel="noopener noreferrer" className="underline">
                        View transaction
                      </a>
                    )}
                  </span>
                  <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
                    <X className="h-4 w-4" />
                  </button>
                </span>
              </FormAlert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Positions */}
      <div className="grid content-start gap-4 rounded-card border-[1.5px] border-ink bg-paper p-6 sm:p-8">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-bold">My stakes</h2>
          {account && <span className="font-mono text-sm tabular">{formatNumber(mistToSui(totalStaked), 2)} SUI</span>}
        </div>
        {!account ? (
          <p className="text-[15px] text-muted">Connect your wallet to see your stakes.</p>
        ) : stakes.length === 0 ? (
          <p className="text-[15px] text-muted">You have no active stakes in this wallet yet.</p>
        ) : (
          <ul className="grid gap-3">
            {stakes.map((s) => {
              const v = poolToValidator.get(s.poolId);
              const pending = snap ? s.activationEpoch > snap.epoch : false;
              return (
                <li key={s.id} className="grid gap-3 rounded-xl border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid">
                      <span className="font-medium">{v?.name ?? "Validator"}</span>
                      <span className="font-mono text-[12px] text-muted">Since epoch {s.activationEpoch}</span>
                    </div>
                    {pending ? <Badge tone="yellow">Activating</Badge> : <Badge tone="success"><Check className="h-3 w-3" />Earning</Badge>}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-xl font-bold tabular">{formatNumber(mistToSui(s.principalMist), 2)} SUI</span>
                    <Button size="sm" variant="outline" onClick={() => unstake(s)} loading={busy === s.id} disabled={!!busy}>
                      Unstake
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-[12.5px] text-muted">
          Amounts show your staked principal. Rewards are added inside the pool and paid out when you unstake. Unstaking returns principal and
          earned rewards in the same transaction. Rewards for the current epoch are not paid.
        </p>
      </div>
    </div>
  );
}
