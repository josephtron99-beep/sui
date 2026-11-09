"use client";

import { motion, useReducedMotion } from "motion/react";
import { LogoMark } from "@/components/ui/logo";

const ease = [0.22, 1, 0.36, 1] as const;

function Hex({ size, fill, className }: { size: number; fill: "yellow" | "ink" | "paper"; className?: string }) {
  const colors = { yellow: "var(--yellow-2)", ink: "var(--ink)", paper: "var(--paper)" };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
      <path d="M50 4 90 27v46L50 96 10 73V27z" fill={colors[fill]} stroke="var(--ink)" strokeWidth={fill === "ink" ? 0 : 5} strokeLinejoin="round" />
    </svg>
  );
}

const floaters = [
  { size: 34, fill: "yellow" as const, top: "18%", left: "48%", d: 0 },
  { size: 16, fill: "ink" as const, top: "8%", left: "2.5%", d: 0.8 },
  { size: 22, fill: "paper" as const, top: "12%", left: "88%", d: 1.4 },
  { size: 14, fill: "ink" as const, top: "82%", left: "56%", d: 0.4 },
  { size: 26, fill: "yellow" as const, top: "62%", left: "93%", d: 1.1 },
];

/** Layered, animated background shared by every page banner. */
export function HeroBackdrop({ quiet = false }: { quiet?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="bg-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_80%_70%_at_30%_40%,#000_30%,transparent_80%)]" />

      <motion.div
        className="absolute -left-[10%] -top-[30%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,var(--yellow)_0%,transparent_65%)] [opacity:var(--glow)] blur-2xl"
        animate={reduce ? undefined : { x: [0, 80, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-[40%] right-[-5%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,var(--yellow-2)_0%,transparent_60%)] [opacity:calc(var(--glow)*0.7)] blur-3xl"
        animate={reduce ? undefined : { x: [0, -60, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -bottom-24 -right-16 text-ink/[0.045] sm:-right-10"
        initial={reduce ? false : { rotate: -12, opacity: 0 }}
        animate={{ rotate: -8, opacity: 1 }}
        transition={{ duration: 1.6, ease }}
      >
        <LogoMark className="h-[420px] w-auto sm:h-[520px]" />
      </motion.div>

      {!quiet && (
        <svg className="absolute right-[4%] top-[6%] hidden w-44 md:block" viewBox="0 0 170 120" fill="none">
          {["M20 10 L150 110", "M50 4 L166 92", "M90 2 L168 62", "M8 40 L110 2"].map((d, i) => (
            <motion.path
              key={d}
              d={d}
              stroke="var(--yellow-2)"
              strokeWidth={6}
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: 0.5 + i * 0.12, ease }}
            />
          ))}
        </svg>
      )}

      {floaters.filter((f) => !quiet || parseFloat(f.left) > 60).map((f, i) => (
        <motion.div
          key={i}
          className="absolute hidden sm:block"
          style={{ top: f.top, left: f.left }}
          initial={reduce ? false : { opacity: 0, scale: 0.4 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: [0, -14, 0], rotate: [0, 12, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.3 + f.d * 0.3 },
            scale: { duration: 0.6, delay: 0.3 + f.d * 0.3, ease },
            y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: f.d },
            rotate: { duration: 7 + i, repeat: Infinity, ease: "easeInOut", delay: f.d },
          }}
        >
          <Hex size={f.size} fill={f.fill} />
        </motion.div>
      ))}
    </div>
  );
}

/** Infinite ticker strip at the bottom of a banner. */
export function HeroTicker({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden surface-dark border-t-[1.5px] border-ink bg-ink py-3 text-paper" aria-hidden>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.18em]">
        {[...row, ...row].map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t}
            <svg viewBox="0 0 100 100" className="h-2.5 w-2.5" aria-hidden>
              <path d="M50 4 90 27v46L50 96 10 73V27z" fill="var(--yellow)" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
