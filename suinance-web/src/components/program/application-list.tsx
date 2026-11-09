import { Badge } from "@/components/ui/primitives";
import type { ValidatorApplication } from "@/db/schema";
import { shortAddress } from "@/lib/utils";

const statusLabel: Record<string, { text: string; tone: "yellow" | "success" | "danger" | "neutral" }> = {
  in_review: { text: "In review", tone: "yellow" },
  approved: { text: "Member", tone: "success" },
  declined: { text: "Not approved", tone: "danger" },
};

export function ApplicationList({ applications }: { applications: ValidatorApplication[] }) {
  return (
    <div className="grid gap-3 rounded-card border-[1.5px] border-ink p-5 sm:p-6">
      <h3 className="text-lg font-bold">Your applications</h3>
      <ul className="grid gap-2">
        {applications.map((a) => {
          const s = statusLabel[a.status] ?? { text: a.status, tone: "neutral" as const };
          return (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
              <span className="grid">
                <span className="font-medium">{a.validatorName}</span>
                <span className="font-mono text-[12px] text-muted">
                  {shortAddress(a.suiAddress)} · {a.activeOnChain ? "active on mainnet" : "not in the active set yet"}
                </span>
              </span>
              <Badge tone={s.tone}>{s.text}</Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
