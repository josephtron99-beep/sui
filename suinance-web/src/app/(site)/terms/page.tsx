import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = pageMeta("/terms", "Terms of Use", "The terms that apply when you use the Suinance website, create an account and build Sui staking transactions with your own wallet.");

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of use"
      title="Terms of use"
      intro="These terms apply when you use the Suinance website or create a Suinance account. By using the site, you agree to them."
      updated="9 November 2026"
      sections={[
        {
          heading: "What Suinance provides",
          body: [
            "Suinance provides information about the Sui network, live validator data and an interface that lets you build and sign Sui staking transactions in your own wallet.",
            "Suinance does not hold, transfer or manage your digital assets. Transactions are executed by the Sui network after you approve them in your wallet.",
          ],
        },
        {
          heading: "Your account",
          body: [
            "You must give accurate details when you register and keep your password secure. You are responsible for activity on your account.",
            "You must be old enough to enter a binding agreement where you live, and you must not use Suinance where staking or crypto assets are prohibited.",
          ],
        },
        {
          heading: "Acceptable use",
          body: [["Do not try to break, overload or gain unauthorised access to the site.", "Do not use the site for fraud, money laundering or any unlawful purpose.", "Do not misuse referral codes or create accounts in bulk."]],
        },
        {
          heading: "Information and risk",
          body: [
            "Network data comes from public Sui sources and may be delayed or incomplete. Estimates are projections, not promises.",
            "Staking carries risk, described in our Risk disclosure. You decide whether and how much to stake.",
          ],
        },
        {
          heading: "Liability",
          body: ["To the extent the law allows, Suinance is provided as is, and we are not liable for losses arising from market movements, validator behaviour, network failures, wallet errors or transactions you approve."],
        },
        {
          heading: "Changes and ending",
          body: ["We may update these terms or the site. If you keep using Suinance after a change, the new terms apply. You can delete your account at any time by contacting us, and we may suspend accounts that break these terms."],
        },
      ]}
    />
  );
}
