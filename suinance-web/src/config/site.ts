export const site = {
  name: "Suinance",
  tagline: "Stake SUI on-chain, earn every epoch",
  description:
    "Suinance is an independent staking hub for Sui. Delegate SUI to validators from your own wallet, follow live on-chain data and earn protocol rewards every epoch.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Fill these in to show them in the footer. Empty values are hidden. */
  social: {
    x: process.env.NEXT_PUBLIC_SOCIAL_X ?? "",
    telegram: process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM ?? "",
    discord: process.env.NEXT_PUBLIC_SOCIAL_DISCORD ?? "",
  },
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "",
};

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn Sui" },
  { href: "/stake", label: "Stake" },
  { href: "/validators", label: "Validators" },
  { href: "/ecosystem", label: "Ecosystem" },
  { href: "/about", label: "About" },
] as const;

export const footerNav = [
  { href: "/faq", label: "FAQ" },
  { href: "/risk-disclosure", label: "Risk disclosure" },
  { href: "/terms", label: "Terms of use" },
  { href: "/privacy", label: "Privacy policy" },
] as const;
