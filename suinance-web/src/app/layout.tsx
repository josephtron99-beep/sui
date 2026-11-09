import type { Metadata, Viewport } from "next";
import { Poppins, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { site } from "@/config/site";
import { themeInitScript } from "@/components/site/theme";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["300", "500", "600", "700", "800"], variable: "--font-poppins", display: "swap" });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-sans", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} · ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: ["Sui staking", "stake SUI", "Sui validators", "SUI rewards", "non-custodial staking", "Sui blockchain"],
  openGraph: { type: "website", siteName: site.name, locale: "en_US", title: `${site.name} · ${site.tagline}`, description: site.description },
  twitter: { card: "summary_large_image", title: `${site.name} · ${site.tagline}`, description: site.description },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${site.url}/#org`, name: site.name, url: site.url, logo: `${site.url}/suinance-logo.svg`, description: site.description },
    { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.name, publisher: { "@id": `${site.url}/#org` } },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-dvh overflow-x-clip">{children}</body>
    </html>
  );
}
