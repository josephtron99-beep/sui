"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/form";
import { Badge } from "@/components/ui/primitives";
import { CheckList } from "./check-list";
import type { CheckResult } from "@/lib/program-check";
import { cn, shortAddress } from "@/lib/utils";

export type CheckerEntry = { name: string; address: string; results: CheckResult[]; failed: number };

export function EligibilityChecker({ entries }: { entries: CheckerEntry[] }) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<CheckerEntry | null>(null);
  const listId = useId();

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return entries.filter((e) => e.name.toLowerCase().includes(s) || e.address.toLowerCase().includes(s)).slice(0, 6);
  }, [q, entries]);

  const looksLikeAddress = /^0x[0-9a-f]{64}$/i.test(q.trim());
  const notActive = looksLikeAddress && matches.length === 0;

  return (
    <div className="grid gap-5 rounded-card border-[1.5px] border-ink bg-paper p-5 shadow-hard sm:p-7">
      <label htmlFor={`${listId}-q`} className="text-sm font-medium">
        Validator name or Sui address
      </label>
      <div className="relative -mt-3">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
        <Input
          id={`${listId}-q`}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPicked(null);
          }}
          placeholder={`Try "${entries[0]?.name ?? "Mysten"}" or 0x…`}
          autoComplete="off"
          spellCheck={false}
          className="pl-11"
          role="combobox"
          aria-expanded={matches.length > 0 && !picked}
          aria-controls={`${listId}-list`}
        />
      </div>

      {!picked && matches.length > 0 && (
        <ul id={`${listId}-list`} role="listbox" className="-mt-2 grid gap-1">
          {matches.map((m) => (
            <li key={m.address} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => {
                  setPicked(m);
                  setQ(m.name);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-yellow-wash"
              >
                <span className="grid">
                  <span className="font-medium">{m.name}</span>
                  <span className="font-mono text-[12px] text-muted">{shortAddress(m.address)}</span>
                </span>
                <Badge tone={m.failed === 0 ? "success" : "danger"}>{m.failed === 0 ? "Eligible" : `${m.failed} not met`}</Badge>
              </button>
            </li>
          ))}
        </ul>
      )}

      {notActive && (
        <p className="rounded-xl bg-yellow-wash p-4 text-[15px]">
          This address is not in Sui&apos;s active validator set this epoch. Candidates can still apply, and we review them once they are active.
        </p>
      )}

      {picked && (
        <div className="grid gap-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-lg font-bold">{picked.name}</span>
            <Badge tone={picked.failed === 0 ? "success" : "danger"}>
              {picked.failed === 0 ? "Meets the automatic checks" : `${picked.failed} check${picked.failed > 1 ? "s" : ""} not met`}
            </Badge>
          </div>
          <CheckList results={picked.results} />
          <Link
            href={`/validators/${picked.address}`}
            className={cn("group inline-flex w-fit items-center gap-2 py-1 font-medium underline-offset-4 hover:underline")}
          >
            Open the full scorecard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}
