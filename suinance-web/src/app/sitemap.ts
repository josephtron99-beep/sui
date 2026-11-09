import type { MetadataRoute } from "next";
import { footerNav, mainNav, site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  return [...mainNav, ...footerNav].map((l) => ({
    url: `${base}${l.href === "/" ? "" : l.href}`,
    changeFrequency: l.href === "/validators" || l.href === "/" ? "hourly" : "monthly",
    priority: l.href === "/" ? 1 : 0.7,
  }));
}
