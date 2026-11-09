import { programRules } from "@/content/program";
import type { Validator } from "@/lib/sui/network";
import { formatNumber } from "@/lib/utils";

export type CheckStatus = "pass" | "fail" | "manual";
export type CheckResult = { key: string; label: string; status: CheckStatus; detail: string };

/**
 * Runs every program criterion that can be read from live on-chain data.
 * Criteria that need history or off-chain facts are returned as "manual".
 */
export function checkValidator(v: Validator): CheckResult[] {
  const commission = Math.max(v.commissionPct, v.nextCommissionPct);
  const missing = [
    !v.name && "name",
    !v.description && "description",
    !v.imageUrl && "logo",
    !v.projectUrl && "website",
  ].filter(Boolean) as string[];

  return [
    {
      key: "active",
      label: "In Sui's active validator set",
      status: v.atRisk ? "fail" : "pass",
      detail: v.atRisk ? "Active, but stake is below Sui's minimum and the validator is at risk of removal." : "Active on mainnet with stake above Sui's minimum.",
    },
    {
      key: "commission",
      label: `Commission at or below ${programRules.maxCommissionPct}%`,
      status: commission <= programRules.maxCommissionPct ? "pass" : "fail",
      detail:
        v.nextCommissionPct !== v.commissionPct
          ? `${formatNumber(v.commissionPct, 2)}% now, ${formatNumber(v.nextCommissionPct, 2)}% from next epoch.`
          : `${formatNumber(v.commissionPct, 2)}% this epoch and next.`,
    },
    {
      key: "reports",
      label: "No peer reports",
      status: v.reportedBy.length === 0 ? "pass" : "fail",
      detail:
        v.reportedBy.length === 0
          ? `No tallying-rule reports this epoch. The full ${programRules.cleanEpochs}-epoch record is checked at review.`
          : `Reported this epoch by ${v.reportedBy.join(", ")}.`,
    },
    {
      key: "voting",
      label: `Voting power under ${programRules.maxVotingPowerPct}%`,
      status: v.votingPowerPct < programRules.maxVotingPowerPct ? "pass" : "fail",
      detail: `${formatNumber(v.votingPowerPct, 2)}% of network voting power.`,
    },
    {
      key: "identity",
      label: "Public identity on-chain",
      status: missing.length === 0 ? "pass" : "fail",
      detail: missing.length === 0 ? "Name, description, logo and website are all set." : `Missing on-chain: ${missing.join(", ")}.`,
    },
    {
      key: "software",
      label: "Current Sui release",
      status: "manual",
      detail: `Node versions are not published on-chain. We confirm the ${programRules.upgradeHours}-hour upgrade window with the operator.`,
    },
  ];
}

export function summarize(results: CheckResult[]) {
  const failed = results.filter((r) => r.status === "fail").length;
  const passed = results.filter((r) => r.status === "pass").length;
  return { passed, failed, total: results.length, eligible: failed === 0 };
}
