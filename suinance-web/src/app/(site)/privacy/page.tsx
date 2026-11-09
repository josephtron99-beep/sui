import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = pageMeta("/privacy", "Privacy Policy", "What personal data Suinance collects when you create an account, why we collect it, who we share it with and the rights you have.");

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy policy"
      title="Privacy policy"
      intro="This policy explains what personal data Suinance collects when you create an account, why we collect it and the choices you have."
      updated="9 November 2026"
      sections={[
        {
          heading: "Data we collect",
          body: [
            [
              "Account details: your name, email address, mobile number and country.",
              "Referral details: the referral code you entered, if any, and the code we give you.",
              "Security data: a one-way hash of your password, verification codes (stored hashed and deleted after use or expiry) and sign-in timestamps.",
            ],
            "Wallet connections happen in your browser. We do not store your wallet address against your account unless you choose to link it in a future feature.",
          ],
        },
        {
          heading: "How we use it",
          body: [["To create and secure your account and verify your email.", "To send codes for verification and password resets.", "To run the referral program.", "To meet legal obligations."]],
        },
        {
          heading: "Sharing",
          body: [
            "We do not sell your data. We share it only with service providers that run the site for us, such as hosting, database and email delivery, and only as needed to provide the service, or when the law requires it.",
          ],
        },
        {
          heading: "Cookies",
          body: ["We use one essential, secure cookie to keep you signed in. We do not use advertising cookies."],
        },
        {
          heading: "Retention and security",
          body: ["We keep account data while your account is open. Passwords are hashed with bcrypt, codes expire after 10 minutes and all traffic is encrypted in transit."],
        },
        {
          heading: "Your rights",
          body: ["Depending on where you live, you can ask to access, correct or delete your data, or object to how it is used. Contact us to make a request."],
        },
      ]}
    />
  );
}
