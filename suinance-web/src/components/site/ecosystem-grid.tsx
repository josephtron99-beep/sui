"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { EcoProject } from "@/content/sui";
import { cn } from "@/lib/utils";

export function EcosystemGrid({ projects }: { projects: EcoProject[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.category)))], [projects]);
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? projects : projects.filter((p) => p.category === cat);

  return (
    <LayoutGroup>
      <div className="grid gap-8">
        <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className="relative shrink-0 rounded-full border-[1.5px] border-ink px-4 py-2 text-sm font-medium"
            >
              {cat === c && <motion.span layoutId="eco-pill" className="absolute inset-0 rounded-full bg-yellow" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>
        <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((p) => (
              <motion.li
                key={p.name}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group grid h-full content-start gap-4 rounded-card border-[1.5px] border-ink bg-paper p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-hard",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-xl border-[1.5px] border-ink bg-yellow font-display text-lg font-extrabold">
                      {p.name.slice(0, 1)}
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
                  </div>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">{p.name}</h3>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{p.category}</span>
                  </div>
                  <p className="text-[15px] text-muted">{p.description}</p>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </LayoutGroup>
  );
}
