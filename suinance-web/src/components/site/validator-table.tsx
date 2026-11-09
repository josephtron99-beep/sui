"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, ExternalLink, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Validator } from "@/lib/sui/network";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { cn, formatCompact, formatNumber, shortAddress } from "@/lib/utils";

type SortKey = "stakeSui" | "commissionPct" | "apyPct" | "name";

export function ValidatorAvatar({ v, size = 36 }: { v: Validator; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!v.imageUrl || failed) {
    return (
      <span className="grid shrink-0 place-items-center rounded-full bg-yellow font-display text-sm font-bold" style={{ width: size, height: size }}>
        {v.name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={v.imageUrl}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full border border-line bg-paper object-cover"
      style={{ width: size, height: size }}
    />
  );
}

export function ValidatorTable({ validators }: { validators: Validator[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "stakeSui", dir: -1 });
  const [partnersOnly, setPartnersOnly] = useState(false);
  const [active, setActive] = useState<Validator | null>(null);
  const hasPartners = validators.some((v) => v.partner);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return validators
      .filter((v) => (!partnersOnly || v.partner) && (!term || v.name.toLowerCase().includes(term) || v.address.toLowerCase().includes(term)))
      .sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * sort.dir;
        return ((av as number) - (bv as number)) * sort.dir;
      });
  }, [validators, q, sort, partnersOnly]);

  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus(); // return focus to the row that opened the drawer
    };
  }, [active]);

  const sortHead = (k: SortKey, label: string, className?: string) => (
    <th key={k} scope="col" className={cn("px-4 py-3", className)} aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? (s.dir === 1 ? -1 : 1) : k === "name" || k === "commissionPct" ? 1 : -1 }))}
        className="-my-2 inline-flex min-h-9 items-center gap-1 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em]"
      >
        {label}
        {sort.key === k && (sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </button>
    </th>
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 sm:max-w-sm">
          <span className="sr-only">Search validators</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or address"
            className="h-11 w-full rounded-full border-[1.5px] border-ink bg-paper pl-11 pr-4 text-[15px] outline-none focus:shadow-[0_0_0_4px_var(--yellow-soft)]"
          />
        </label>
        {hasPartners && (
          <button
            type="button"
            aria-pressed={partnersOnly}
            onClick={() => setPartnersOnly((p) => !p)}
            className={cn("h-11 rounded-full border-[1.5px] border-ink px-5 text-sm font-medium transition", partnersOnly ? "bg-yellow" : "bg-paper hover:bg-yellow-soft")}
          >
            Suinance partners
          </button>
        )}
        <span className="ml-auto font-mono text-[12px] text-muted">{rows.length} validators</span>
      </div>

      <div className="overflow-hidden rounded-card border-[1.5px] border-ink" data-lenis-prevent>
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full min-w-[720px] text-left text-[15px]">
            <thead className="surface-dark sticky top-0 z-10 bg-ink text-paper">
              <tr>
                {sortHead("name", "Validator")}
                {sortHead("stakeSui", "Total stake", "text-right")}
                {sortHead("commissionPct", "Commission", "text-right")}
                {sortHead("apyPct", "Est. rate", "text-right")}
                <th scope="col" className="px-4 py-3 text-right font-mono text-[11px] font-medium uppercase tracking-[0.14em]">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.address} className="group border-t border-line transition-colors hover:bg-yellow-wash">
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setActive(v)} className="flex items-center gap-3 text-left">
                      <ValidatorAvatar v={v} />
                      <span className="grid">
                        <span className="flex items-center gap-2 font-medium group-hover:underline">
                          {v.name}
                          {v.partner && <Badge tone="yellow">Program</Badge>}
                          {v.atRisk && <Badge tone="danger">At risk</Badge>}
                        </span>
                        <span className="font-mono text-[12px] text-muted">{shortAddress(v.address)}</span>
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular">{formatCompact(v.stakeSui)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular">{formatNumber(v.commissionPct, 2)}%</td>
                  <td className="px-4 py-3 text-right font-mono tabular">{formatNumber(v.apyPct, 2)}%</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => setActive(v)} className={buttonClasses("outline", "sm")}>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted">
                    No validators match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <>
            <motion.div className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)} />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={`${active.name} details`}
              data-lenis-prevent
              className="fixed inset-y-0 right-0 z-[80] grid w-full max-w-md content-start gap-6 overflow-y-auto border-l-[1.5px] border-ink bg-paper p-6 sm:p-8"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ValidatorAvatar v={active} size={52} />
                  <div>
                    <h3 className="text-xl font-bold">{active.name}</h3>
                    <span className="font-mono text-[12px] text-muted">{shortAddress(active.address, 10)}</span>
                  </div>
                </div>
                <button type="button" onClick={() => setActive(null)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full border-[1.5px] border-ink" autoFocus>
                  <X className="h-4 w-4" />
                </button>
              </div>
              {active.description && <p className="text-[15px] text-muted">{active.description}</p>}
              <dl className="grid grid-cols-2 gap-3">
                {[
                  ["Total stake", `${formatNumber(active.stakeSui, 0)} SUI`],
                  ["Voting power", `${formatNumber(active.votingPowerPct, 2)}%`],
                  ["Commission", `${formatNumber(active.commissionPct, 2)}%`],
                  ["Est. rate", `${formatNumber(active.apyPct, 2)}%`],
                  ["Gas price quote", `${active.gasPrice} MIST`],
                  ["Active since epoch", `${active.activationEpoch}`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-line p-3">
                    <dt className="text-[12px] text-muted">{k}</dt>
                    <dd className="font-mono text-[15px] tabular">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="grid gap-2">
                <Link href={`/validators/${active.address}`} className={buttonClasses("primary", "lg", "w-full")}>
                  Full scorecard &amp; program checks
                </Link>
                <a href={`https://suiscan.xyz/mainnet/validator/${active.address}`} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline", "lg", "w-full")}>
                  View on Suiscan <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
                {active.projectUrl && (
                  <a href={active.projectUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("ghost", "md", "w-full")}>
                    Validator website <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                )}
              </div>
              <p className="text-[12.5px] text-muted">
                The estimated rate applies last epoch&apos;s network rewards to this validator&apos;s commission. Actual rewards depend on the
                validator&apos;s performance and change every epoch.
              </p>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
