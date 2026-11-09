"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus, RotateCcw, Play } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/* ───────────── Account model vs object model ───────────── */
export function ModelToggle() {
  const [mode, setMode] = useState<"acct" | "obj">("obj");
  const reduce = useReducedMotion();
  const lanes = mode === "acct" ? 1 : 4;
  const perLane = mode === "acct" ? 8 : 2;

  return (
    <div className="grid gap-5 rounded-card border-[1.5px] border-ink bg-paper p-5 sm:p-6">
      <div role="radiogroup" aria-label="Compare data models" className="inline-flex w-fit rounded-full border-[1.5px] border-ink p-1">
        {(
          [
            ["acct", "Account model"],
            ["obj", "Sui object model"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            role="radio"
            aria-checked={mode === k}
            onClick={() => setMode(k)}
            className="relative rounded-full px-4 py-2 text-sm font-medium"
          >
            {mode === k && <motion.span layoutId="model-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            <span className={cn("relative transition-colors", mode === k ? "text-paper" : "text-muted")}>{label}</span>
          </button>
        ))}
      </div>

      <div className="grid h-48 content-center gap-3 overflow-hidden rounded-xl bg-yellow-wash p-4" aria-hidden>
        {Array.from({ length: lanes }).map((_, l) => (
          <div key={`${mode}-${l}`} className="relative h-8 rounded-md bg-paper/80">
            {Array.from({ length: perLane }).map((__, i) => (
              <motion.span
                key={i}
                className={cn("absolute top-1 h-6 w-6 rounded-md border-[1.5px] border-ink", mode === "obj" ? "bg-yellow" : "bg-ink/80")}
                initial={{ left: "-10%" }}
                animate={reduce ? { left: `${10 + i * 10}%` } : { left: ["-10%", "105%"] }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: mode === "acct" ? 8 : 2.4, delay: mode === "acct" ? i : i * 1.2 + l * 0.2, repeat: Infinity, ease: "linear" }
                }
              />
            ))}
          </div>
        ))}
      </div>
      <p className="min-h-[3.2em] text-[15px] text-muted" aria-live="polite">
        {mode === "acct"
          ? "Account model: every transaction waits in one queue, even when two of them have nothing to do with each other."
          : "Object model: transactions that touch different objects run side by side, so the network can process far more at once."}
      </p>
    </div>
  );
}

/* ───────────── Mysticeti DAG stepper ───────────── */
const V = 4;
const R = 5;
const dagMsgs = [
  "Round 1: each validator proposes a block of transactions.",
  "Round 2: new blocks link back to blocks from round 1. Together the links form a graph (a DAG).",
  "Round 3: once enough validators link to the round 1 leader, it and its history are committed. No extra voting messages are needed.",
  "Round 4: commits keep following about two rounds behind the newest blocks.",
  "Round 5: the graph keeps growing while earlier rounds are finalised, which is how Mysticeti reaches sub-second finality.",
];

export function ConsensusDag() {
  const [round, setRound] = useState(2);
  const pos = (r: number, v: number) => [70 + r * 120, 34 + v * 50] as const;

  return (
    <div className="grid gap-4 rounded-card border-[1.5px] border-ink bg-paper p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Mysticeti, simplified</span>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setRound((r) => (r >= R ? 1 : r + 1))}>
            <Play className="h-3.5 w-3.5" aria-hidden /> Next round
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRound(0)}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
          </Button>
        </div>
      </div>
      <div className="no-scrollbar -mx-2 overflow-x-auto px-2">
        <svg viewBox="0 0 640 230" className="h-auto w-full min-w-[520px]" role="img" aria-label={`Validators proposing blocks, round ${round} of ${R}`}>
          {Array.from({ length: V }).map((_, v) => (
            <text key={v} x={8} y={38 + v * 50} className="fill-muted font-mono text-[11px]">
              V{v + 1}
            </text>
          ))}
          {Array.from({ length: R }).map((_, r) => (
            <text key={r} x={pos(r, 0)[0]} y={222} textAnchor="middle" className="fill-muted font-mono text-[11px]">
              Round {r + 1}
            </text>
          ))}
          <AnimatePresence>
            {Array.from({ length: Math.max(0, round - 1) }).flatMap((_, ri) => {
              const r = ri + 1;
              return Array.from({ length: V }).flatMap((__, v) =>
                Array.from({ length: V })
                  .map((___, p) => {
                    if ((v + p + r) % 4 === 3) return null;
                    const [x1, y1] = pos(r - 1, p);
                    const [x2, y2] = pos(r, v);
                    return (
                      <motion.line
                        key={`l-${r}-${v}-${p}`}
                        x1={x1 + 14}
                        y1={y1}
                        x2={x2 - 14}
                        y2={y2}
                        stroke="var(--ink)"
                        strokeOpacity={0.22}
                        strokeWidth={1.3}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease }}
                      />
                    );
                  })
                  .filter(Boolean),
              );
            })}
            {Array.from({ length: round }).flatMap((_, r) =>
              Array.from({ length: V }).map((__, v) => {
                const [x, y] = pos(r, v);
                const leader = r % 2 === 0 && v === r % V;
                const committed = r < round - 2;
                return (
                  <motion.rect
                    key={`b-${r}-${v}`}
                    x={x - 14}
                    y={y - 12}
                    width={28}
                    height={24}
                    rx={6}
                    stroke="var(--ink)"
                    strokeWidth={1.5}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, fill: leader ? "var(--yellow-2)" : committed ? "var(--ink)" : "var(--paper)" }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease, delay: v * 0.05 }}
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  />
                );
              }),
            )}
          </AnimatePresence>
        </svg>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm border-[1.5px] border-ink bg-paper" />Proposed block</span>
        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm border-[1.5px] border-ink bg-ink" />Committed block</span>
        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm border-[1.5px] border-ink bg-yellow-2" />Leader block</span>
      </div>
      <p className="min-h-[3.2em] text-[15px] text-muted" aria-live="polite">
        {round === 0 ? "Each validator proposes a block every round, and each block links to blocks from the previous round." : dagMsgs[round - 1]}
      </p>
    </div>
  );
}

/* ───────────── Expandable tech cards ───────────── */
export function TechGrid({ items }: { items: { title: string; short: string; long: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((t, i) => {
        const isOpen = open === i;
        return (
          <div key={t.title} className={cn("rounded-card border-[1.5px] border-ink bg-paper transition-colors", isOpen && "bg-yellow-wash")}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${id}-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-start justify-between gap-4 p-5 text-left"
            >
              <span className="grid gap-1">
                <span className="font-display text-lg font-bold">{t.title}</span>
                <span className="text-sm text-muted">{t.short}</span>
              </span>
              <Plus className={cn("mt-1 h-5 w-5 shrink-0 transition-transform duration-300", isOpen && "rotate-45")} aria-hidden />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease }}
                  className="overflow-hidden"
                >
                  <p className="border-t border-dashed border-ink/20 px-5 pb-5 pt-4 text-[15px]">{t.long}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────── Tokenomics donut ───────────── */
function donutArcs(pcts: number[], sel: number) {
  const cx = 130,
    cy = 130,
    ro = 118,
    ri = 74,
    gap = 0.014;
  const starts = pcts.map((_, i) => -Math.PI / 2 + (pcts.slice(0, i).reduce((s, p) => s + p, 0) / 100) * Math.PI * 2);
  // Rounded so server and browser produce identical path strings.
  const p = (r: number, a: number) => [Math.round((cx + r * Math.cos(a)) * 100) / 100, Math.round((cy + r * Math.sin(a)) * 100) / 100];
  return pcts.map((pct, i) => {
    const a0 = starts[i];
    const a1 = a0 + (pct / 100) * Math.PI * 2;
    const r2 = i === sel ? ro + 6 : ro;
    const [x1, y1] = p(r2, a0 + gap);
    const [x2, y2] = p(r2, a1 - gap);
    const [x3, y3] = p(ri, a1 - gap);
    const [x4, y4] = p(ri, a0 + gap);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${x1} ${y1}A${r2} ${r2} 0 ${large} 1 ${x2} ${y2}L${x3} ${y3}A${ri} ${ri} 0 ${large} 0 ${x4} ${y4}Z`;
  });
}

const sliceColors = ["var(--ink)", "var(--yellow-2)", "#6b6b6b", "var(--brass)", "#d8d8d8"];

export function TokenDonut({ items }: { items: { name: string; pct: number; note: string }[] }) {
  const [sel, setSel] = useState(0);
  const arcs = donutArcs(items.map((s) => s.pct), sel);

  return (
    <div className="grid items-center gap-8 md:grid-cols-[280px_1fr]">
      <div className="relative mx-auto w-full max-w-[280px]">
        <svg viewBox="0 0 260 260" className="h-auto w-full" aria-hidden>
          {arcs.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              fill={sliceColors[i]}
              stroke="var(--ink)"
              strokeWidth={i === sel ? 1.5 : 0}
              animate={{ opacity: i === sel ? 1 : 0.55, d }}
              transition={{ duration: 0.35, ease }}
              onClick={() => setSel(i)}
              className="cursor-pointer"
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <AnimatePresence mode="wait">
            <motion.div key={sel} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              <span className="block font-display text-4xl font-extrabold">{items[sel].pct}%</span>
              <span className="font-mono text-xs text-muted">{(items[sel].pct / 10).toFixed(1)}B SUI</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="grid gap-4">
        <ul className="grid">
          {items.map((s, i) => (
            <li key={s.name}>
              <button
                type="button"
                onClick={() => setSel(i)}
                aria-pressed={sel === i}
                className={cn("grid w-full grid-cols-[14px_1fr_auto] items-center gap-3 border-b border-line py-3 text-left transition-opacity", sel !== i && "opacity-55 hover:opacity-100")}
              >
                <i className="h-3.5 w-3.5 rounded-sm border border-ink/30" style={{ background: sliceColors[i] }} />
                <span className="font-medium">{s.name}</span>
                <span className="font-mono tabular">{s.pct}%</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="min-h-[3em] text-[15px] text-muted" aria-live="polite">
          {items[sel].note}
        </p>
      </div>
    </div>
  );
}

/* ───────────── Use-case tabs (ARIA tabs pattern) ───────────── */
export function UseCaseTabs({ items }: { items: { key: string; title: string; heading: string; points: string[] }[] }) {
  const [sel, setSel] = useState(0);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const fromKeyboard = useRef(false);

  useEffect(() => {
    if (fromKeyboard.current) refs.current[sel]?.focus({ preventScroll: true });
    fromKeyboard.current = false;
  }, [sel]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      fromKeyboard.current = true;
      setSel((s) => (s + 1) % items.length);
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      fromKeyboard.current = true;
      setSel((s) => (s - 1 + items.length) % items.length);
    }
  };

  return (
    <div className="grid gap-5 md:grid-cols-[240px_1fr]">
      <div role="tablist" aria-label="What SUI is used for" aria-orientation="vertical" className="no-scrollbar flex gap-2 overflow-x-auto md:grid md:content-start" onKeyDown={onKey}>
        {items.map((u, i) => (
          <button
            key={u.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`${id}-t-${i}`}
            aria-selected={sel === i}
            aria-controls={`${id}-p`}
            tabIndex={sel === i ? 0 : -1}
            onClick={() => setSel(i)}
            className={cn(
              "flex shrink-0 items-center justify-between gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left text-[15px] transition-colors",
              sel === i ? "border-ink bg-yellow font-semibold" : "border-line hover:border-ink/40",
            )}
          >
            {u.title}
            <span className="font-mono text-[11px] text-muted">0{i + 1}</span>
          </button>
        ))}
      </div>
      <div id={`${id}-p`} role="tabpanel" aria-labelledby={`${id}-t-${sel}`} className="min-h-[240px] rounded-card border-[1.5px] border-ink bg-paper p-6">
        <AnimatePresence mode="wait">
          <motion.div key={sel} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25, ease }} className="grid gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{items[sel].title}</span>
            <h3 className="text-2xl font-bold">{items[sel].heading}</h3>
            <ul className="grid gap-3">
              {items[sel].points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px]">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-yellow-2 ring-1 ring-ink" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
