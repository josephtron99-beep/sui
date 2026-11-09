import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = pageMeta("/risk-disclosure", "Risk Disclosure", "Risks for validator operators and SUI holders: no guaranteed delegation, validator operations, data and software risk, SUI price and regulation.");

export default function RiskPage() {
  return (
    <LegalPage
      eyebrow="Risk disclosure"
      title="Understand the risks"
      intro="Running or backing a Sui validator carries real risk. Read these points before you apply to the program or act on anything you see on Suinance."
      updated="9 November 2026"
      sections={[
        {
          heading: "No guaranteed delegation",
          body: [
            "Joining the program does not guarantee any amount of stake. SUI holders decide for themselves where to stake, and Suinance does not control their choices.",
            "Program status can change. A validator that stops meeting the criteria leaves the program after the grace period.",
          ],
        },
        {
          heading: "Validator operations",
          body: [
            "Operators are fully responsible for their nodes, keys, hardware, hosting and upgrades. Downtime, misconfiguration or late upgrades can lead to peer reports, which reduce the rewards paid to the validator's staking pool.",
            "A validator whose voting power falls below Sui's thresholds can be removed from the active set by the protocol.",
          ],
        },
        {
          heading: "Rewards and price",
          body: [
            "Validator and staking rewards are set by the Sui protocol and change every epoch. Any figure on Suinance describes the past and is not a promise.",
            "Rewards are paid in SUI. The market price of SUI can fall as well as rise.",
          ],
        },
        {
          heading: "Data and software",
          body: [
            "Network data comes from public Sui sources and may be delayed or incomplete. Blockchain software can contain bugs. Always verify important numbers on a Sui explorer.",
          ],
        },
        {
          heading: "Regulation and taxes",
          body: ["Rules for validators, staking and crypto assets differ by country and can change. You are responsible for following the law where you operate and for any taxes due."],
        },
        {
          heading: "No advice",
          body: ["Nothing on Suinance is financial, investment, legal or tax advice. If you are unsure, speak to a qualified adviser."],
        },
      ]}
    />
  );
}
