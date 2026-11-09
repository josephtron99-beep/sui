"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn, formatNumber } from "@/lib/utils";

const EPOCHS_PER_YEAR = 365;

/** Compounds per epoch and skips the first (warm-up) epoch. */
function project(amount: number, apyPct: number, days: number) {
  const perEpoch = Math.pow(1 + apyPct / 100, 1 / EPOCHS_PER_YEAR) - 1;
  const earningEpochs = Math.max(0, Math.floor(days) - 1);
  return amount * (Math.pow(1 + perEpoch, earningEpochs) - 1);
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="grid gap-3">
      <label htmlFor={id} className="flex items-baseline justify-between gap-4 text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-base font-medium text-ink tabular">{display}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-6 w-full cursor-pointer appearance-none bg-transparent accent-ink [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[linear-gradient(90deg,var(--ink)_var(--pct),var(--line)_var(--pct))] [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-line [&::-moz-range-progress]:h-2 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-ink [&::-webkit-slider-thumb]:-mt-1.5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ink [&::-moz-range-thumb]:bg-yellow [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-yellow [&::-webkit-slider-thumb]:shadow-hard-sm"
        style={{ ["--pct" as string]: `${pct}%` }}
      />
    </div>
  );
}

export function Estimator({ apyPct, className }: { apyPct: number | null; className?: string }) {
  const liveApy = apyPct && apyPct > 0 ? apyPct : null;
  const [amount, setAmount] = useState(10000);
  const [apy, setApy] = useState(liveApy ? Number(liveApy.toFixed(2)) : 1.5);
  const [days, setDays] = useState(365);

  const result = useMemo(() => project(amount, apy, days), [amount, apy, days]);
  const perDay = useMemo(() => project(amount, apy, 366) / 365, [amount, apy]);

  return (
    <div className={cn("grid gap-6 rounded-card border-[1.5px] border-ink bg-paper p-6 shadow-hard sm:p-8", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Rewards estimator</span>
        {liveApy && (
          <button
            type="button"
            onClick={() => setApy(Number(liveApy.toFixed(2)))}
            className="min-h-9 rounded-full bg-yellow-soft px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider text-ink transition hover:bg-yellow"
          >
            Use live rate · {liveApy.toFixed(2)}%
          </button>
        )}
      </div>
      <Slider id="est-amount" label="Amount to stake" value={amount} min={1} max={250000} step={1} onChange={setAmount} display={`${formatNumber(amount)} SUI`} />
      <Slider id="est-apy" label="Annual rate (net of commission)" value={apy} min={0.5} max={8} step={0.05} onChange={setApy} display={`${apy.toFixed(2)}%`} />
      <Slider id="est-days" label="Time staked" value={days} min={2} max={1095} step={1} onChange={setDays} display={days >= 365 ? `${(days / 365).toFixed(1)} yr` : `${days} days`} />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-yellow p-4">
          <span className="block text-[12px] text-ink/70">Estimated rewards</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={result.toFixed(2)}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="block font-display text-2xl font-extrabold tabular sm:text-3xl"
            >
              {formatNumber(result, 2)}
            </motion.span>
          </AnimatePresence>
          <span className="font-mono text-[11px]">SUI</span>
        </div>
        <div className="rounded-xl bg-yellow-wash p-4">
          <span className="block text-[12px] text-muted">About per day</span>
          <span className="block font-display text-2xl font-extrabold tabular sm:text-3xl">{formatNumber(perDay, 3)}</span>
          <span className="font-mono text-[11px]">SUI</span>
        </div>
      </div>
      <p className="text-[12.5px] leading-relaxed text-muted">
        Estimate only. Compounds every epoch and leaves out the first epoch, when new stake is not yet active. The real rate changes every
        epoch and rewards are paid in SUI, whose price can fall as well as rise.
      </p>
    </div>
  );
}
