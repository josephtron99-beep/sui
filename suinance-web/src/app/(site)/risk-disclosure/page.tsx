import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = pageMeta("/risk-disclosure", "Risk Disclosure", "The risks of staking SUI: price risk, variable rewards, validator performance, timing, wallet security and regulation. Read before you stake.");

export default function RiskPage() {
  return (
    <LegalPage
      eyebrow="Risk disclosure"
      title="Understand the risks before you stake"
      intro="Staking SUI is not a savings account. Read these points carefully and only stake what you can afford to have exposed to them."
      updated="9 November 2026"
      sections={[
        {
          heading: "Price risk",
          body: ["Rewards are paid in SUI. The market price of SUI can fall as well as rise, so the value of your stake and rewards in any other currency can go down, including below what you started with."],
        },
        {
          heading: "Variable rewards",
          body: [
            "Staking rewards are set by the Sui protocol and change every epoch. They depend on total stake, the stake subsidy schedule, gas fees and each validator's commission and performance.",
            "Any rate or estimate shown on Suinance describes the past or is a projection. It is not a promise of future rewards.",
          ],
        },
        {
          heading: "Validator performance",
          body: [
            "Sui does not currently slash staked principal. However, validators that perform badly can be reported by their peers, which reduces the rewards paid to their staking pool.",
            "Validators can change their commission for future epochs, and can leave the active set.",
          ],
        },
        {
          heading: "Timing",
          body: ["New stake becomes active at the start of the next epoch, about 24 hours later, and earns nothing before then. Rewards for the epoch in progress are not paid when you unstake."],
        },
        {
          heading: "Wallet and software risk",
          body: [
            "You are responsible for your wallet, your recovery phrase and every transaction you approve. Lost keys cannot be recovered by Suinance or anyone else.",
            "Blockchain software, wallets and websites can contain bugs. Check every transaction in your wallet before you approve it.",
          ],
        },
        {
          heading: "Regulation and taxes",
          body: ["The rules for staking and crypto assets differ by country and can change. You are responsible for checking that staking is allowed where you live and for any taxes due on rewards."],
        },
        {
          heading: "No advice",
          body: ["Nothing on Suinance is financial, investment, legal or tax advice. If you are unsure, speak to a qualified adviser."],
        },
      ]}
    />
  );
}
