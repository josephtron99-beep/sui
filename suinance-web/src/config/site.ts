export const site = {
  name: "Suinance",
  tagline: "The validator program for Sui",
  description:
    "Suinance is an independent validator program for Sui. Operators meet public, on-chain standards, are checked every epoch and are introduced to the SUI holders who choose who secures the network.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Footer social links. Replace the defaults with the Suinance profile URLs (or set the env vars). */
  social: {
    x: process.env.NEXT_PUBLIC_SOCIAL_X || "https://x.com",
    telegram: process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM || "https://telegram.org",
    medium: process.env.NEXT_PUBLIC_SOCIAL_MEDIUM || "https://medium.com",
  },
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "",
};

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/program", label: "Program" },
  { href: "/validators", label: "Validators" },
  { href: "/learn", label: "Learn Sui" },
  { href: "/ecosystem", label: "Ecosystem" },
  { href: "/about", label: "About" },
] as const;

export const footerNav = [
  { href: "/faq", label: "FAQ" },
  { href: "/risk-disclosure", label: "Risk disclosure" },
  { href: "/terms", label: "Terms of use" },
  { href: "/privacy", label: "Privacy policy" },
] as const;
