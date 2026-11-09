"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Wallet } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { cn, formatNumber } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

function useFloat(delay = 0, amount = 10) {
  const reduce = useReducedMotion();
  return reduce
    ? {}
    : {
        animate: { y: [0, -amount, 0] },
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay },
      };
}

function Panel({ className, children, delay = 0, rotate = 0 }: { className?: string; children: React.ReactNode; delay?: number; rotate?: number }) {
  const float = useFloat(delay);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotate * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease, delay: 0.2 + delay * 0.3 }}
      className={cn("absolute", className)}
    >
      <motion.div {...float} className="rounded-2xl border-[1.5px] border-ink bg-paper p-4 shadow-hard">
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─────────── Learn: three floating cards (object, consensus, Move) ─────────── */
export function LearnVisual() {
  return (
    <div className="relative mx-auto h-[400px] w-full max-w-[460px] sm:h-[430px]" aria-hidden>
      <Panel className="left-0 top-0 w-[58%]" rotate={-4}>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Object</span>
        <div className="mt-2 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-yellow font-display text-sm font-bold">S</span>
          <span className="font-display font-bold">Coin&lt;SUI&gt;</span>
        </div>
        <dl className="mt-3 grid gap-1 font-mono text-[11px]">
          {[
            ["owner", "you"],
            ["abilities", "key, store"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-t border-line pt-1">
              <dt className="text-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel className="right-0 top-[26%] w-[54%]" delay={1} rotate={3}>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Mysticeti DAG</span>
        <svg viewBox="0 0 200 90" className="mt-2 w-full">
          {[0, 1, 2, 3].flatMap((r) =>
            [0, 1, 2].map((v) => (
              <motion.rect
                key={`${r}-${v}`}
                x={10 + r * 50}
                y={8 + v * 28}
                width={22}
                height={18}
                rx={4}
                stroke="var(--ink)"
                strokeWidth={1.5}
                initial={{ fill: "var(--paper)" }}
                animate={{ fill: r < 2 ? "var(--ink)" : r === 2 && v === 1 ? "var(--yellow-2)" : "var(--paper)" }}
                transition={{ duration: 0.4, delay: 0.8 + r * 0.25 + v * 0.05 }}
              />
            )),
          )}
          {[0, 1, 2].flatMap((r) =>
            [0, 1, 2].map((v) => <line key={`l${r}${v}`} x1={32 + r * 50} y1={17 + v * 28} x2={60 + r * 50} y2={17 + ((v + 1) % 3) * 28} stroke="var(--ink)" strokeOpacity={0.25} />),
          )}
        </svg>
        <span className="mt-1 block text-[12px] text-muted">Final in about half a second</span>
      </Panel>

      <Panel className="bottom-0 left-[2%] w-[78%]" delay={2} rotate={-2}>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Move</span>
        <pre className="surface-dark mt-2 overflow-hidden rounded-lg bg-ink p-3 font-mono text-[10.5px] leading-relaxed text-paper">
          <span className="text-yellow">public fun</span>
          {" send(coin: Coin<SUI>, to: address) {\n  transfer::public_transfer(coin, to)\n}"}
        </pre>
      </Panel>
    </div>
  );
}

/* ─────────── Stake: wallet → validator → rewards flow ─────────── */
export function StakeVisual({ apyPct, epoch }: { apyPct: number | null; epoch: number | null }) {
  const reduce = useReducedMotion();
  const float = useFloat(0, 8);
  return (
    <div className="relative mx-auto w-full max-w-[440px]" aria-hidden>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.25 }}
      >
        <motion.div {...float} className="grid gap-4 rounded-3xl border-[1.5px] border-ink bg-paper p-5 shadow-hard sm:p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Native staking</span>
            <span className="flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Mainnet
            </span>
          </div>

          <div className="relative grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
            {[
              { label: "Your wallet", icon: <Wallet className="h-5 w-5" /> },
              { label: "Validator pool", icon: <LogoMark className="h-5 w-auto" /> },
              { label: "Rewards", icon: <span className="font-display text-sm font-extrabold">+%</span> },
            ].map((n, i) => (
              <div key={n.label} className="contents">
                <div className="grid justify-items-center gap-2 text-center">
                  <span className={cn("grid h-12 w-12 place-items-center rounded-2xl border-[1.5px] border-ink", i === 1 ? "surface-dark bg-ink text-yellow" : "bg-yellow")}>{n.icon}</span>
                  <span className="text-[11px] leading-tight text-muted">{n.label}</span>
                </div>
                {i < 2 && (
                  <div className="relative mb-5 h-[2px] w-6 bg-ink/20 sm:w-10">
                    {!reduce && (
                      <motion.span
                        className="absolute -top-[3px] h-2 w-2 rounded-full bg-ink"
                        animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
                      />
                    )}
                    <ArrowRight className="absolute -right-2 -top-[7px] h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-yellow p-3">
              <span className="block text-[11px] text-ink/70">Network rate (est.)</span>
              <span className="font-display text-2xl font-extrabold tabular">{apyPct ? `${formatNumber(apyPct, 2)}%` : "Live"}</span>
            </div>
            <div className="rounded-xl bg-yellow-wash p-3">
              <span className="block text-[11px] text-muted">Current epoch</span>
              <span className="font-display text-2xl font-extrabold tabular">{epoch ? formatNumber(epoch) : "Live"}</span>
            </div>
          </div>

          <ul className="grid gap-2 text-[13px]">
            {["Coins stay in your address", "Active from the next epoch", "Withdraw any time"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full surface-dark bg-ink text-yellow">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─────────── Ecosystem: projects orbiting the Suinance mark ─────────── */
export function EcosystemVisual({ names }: { names: string[] }) {
  const reduce = useReducedMotion();
  const rings = [names.slice(0, 5), names.slice(5, 12)];
  return (
    <div className="relative mx-auto aspect-square w-[82%] max-w-[440px] sm:w-full" aria-hidden>
      {rings.map((ring, r) => {
        const size = r === 0 ? 56 : 92;
        const dur = r === 0 ? 40 : 60;
        return (
          <motion.div
            key={r}
            className="absolute rounded-full border-[1.5px] border-dashed border-ink/25"
            style={{ inset: `${(100 - size) / 2}%` }}
            animate={reduce ? undefined : { rotate: r === 0 ? 360 : -360 }}
            transition={{ duration: dur, repeat: Infinity, ease: "linear" }}
          >
            {ring.map((n, i) => {
              const a = (i / ring.length) * Math.PI * 2;
              return (
                <div
                  key={n}
                  className="absolute"
                  style={{
                    left: `${(50 + Math.cos(a) * 50).toFixed(3)}%`,
                    top: `${(50 + Math.sin(a) * 50).toFixed(3)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <motion.span
                    className={cn(
                      "block whitespace-nowrap rounded-full border-[1.5px] border-ink px-3 py-1.5 text-[12px] font-semibold shadow-hard-sm",
                      (i + r) % 3 === 0 ? "bg-yellow" : "bg-paper",
                    )}
                    animate={reduce ? undefined : { rotate: r === 0 ? -360 : 360 }}
                    transition={{ duration: dur, repeat: Infinity, ease: "linear" }}
                  >
                    {n}
                  </motion.span>
                </div>
              );
            })}
          </motion.div>
        );
      })}
      <motion.div
        className="absolute inset-[34%] grid place-items-center surface-dark rounded-full border-[1.5px] border-line bg-ink shadow-hard"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease }}
      >
        <LogoMark className="h-1/2 w-auto text-yellow" />
      </motion.div>
    </div>
  );
}
