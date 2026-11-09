import { Check, Minus, X } from "lucide-react";
import type { CheckResult } from "@/lib/program-check";
import { cn } from "@/lib/utils";

const icon = {
  pass: { Icon: Check, cls: "bg-success text-white", label: "Pass" },
  fail: { Icon: X, cls: "bg-danger text-white", label: "Not met" },
  manual: { Icon: Minus, cls: "bg-line text-ink", label: "Checked at review" },
};

export function CheckList({ results, className }: { results: CheckResult[]; className?: string }) {
  return (
    <ul className={cn("grid gap-2", className)}>
      {results.map((r) => {
        const s = icon[r.status];
        return (
          <li key={r.key} className="flex items-start gap-3 rounded-xl border border-line bg-paper p-4">
            <span className={cn("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full", s.cls)}>
              <s.Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="grid gap-0.5">
              <span className="font-medium">
                {r.label}
                <span className="sr-only">: {s.label}</span>
              </span>
              <span className="text-[14px] text-muted">{r.detail}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
