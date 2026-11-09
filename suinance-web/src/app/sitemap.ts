import type { MetadataRoute } from "next";
import { footerNav, mainNav, site } from "@/config/site";
import { safeNetworkSnapshot } from "@/lib/sui/network";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const pages: MetadataRoute.Sitemap = [...mainNav, ...footerNav].map((l) => ({
    url: `${base}${l.href === "/" ? "" : l.href}`,
    changeFrequency: l.href === "/validators" || l.href === "/" ? "hourly" : "monthly",
    priority: l.href === "/" ? 1 : l.href === "/program" ? 0.9 : 0.7,
  }));
  const snap = await safeNetworkSnapshot();
  const scorecards: MetadataRoute.Sitemap = (snap?.validators ?? []).map((v) => ({
    url: `${base}/validators/${v.address}`,
    changeFrequency: "daily",
    priority: 0.5,
  }));
  return [...pages, ...scorecards];
}
