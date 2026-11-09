import { CountUp } from "@/components/ui/motion";
import type { NetworkSnapshot } from "@/lib/sui/network";
import { cn } from "@/lib/utils";

export function LiveStats({ snap, className }: { snap: NetworkSnapshot | null; className?: string }) {
  if (!snap) {
    return (
      <div className={cn("rounded-card border-[1.5px] border-dashed border-ink/40 p-6 text-sm text-muted", className)}>
        Live Sui network data is temporarily unavailable. Please check again shortly.
      </div>
    );
  }
  const items = [
    { label: "Active validators", node: <CountUp value={snap.validatorCount} /> },
    { label: "SUI staked with validators", node: <CountUp value={snap.totalStakeSui / 1e9} decimals={2} suffix="B" /> },
    { label: "Reference gas price (MIST)", node: <CountUp value={snap.referenceGasPrice} /> },
    { label: "Current epoch", node: <CountUp value={snap.epoch} /> },
  ];
  return (
    <div className={cn("overflow-hidden rounded-card border-[1.5px] border-ink bg-paper", className)}>
      <div className="grid grid-cols-2 divide-ink/10 lg:grid-cols-4 lg:divide-x">
        {items.map((it, i) => (
          <div key={it.label} className={cn("grid gap-1.5 p-5 sm:p-6", i < 2 && "border-b border-ink/10 lg:border-b-0", i % 2 === 0 && "border-r border-ink/10 lg:border-r-0")}>
            <span className="font-display text-[clamp(24px,3vw,34px)] font-extrabold leading-none">{it.node}</span>
            <span className="text-[13px] text-muted">{it.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-ink/10 bg-yellow-wash px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted sm:px-6">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        Live from Sui mainnet · updated every few minutes
      </div>
    </div>
  );
}
