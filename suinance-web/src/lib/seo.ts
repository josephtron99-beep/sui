import type { Metadata } from "next";
import { site } from "@/config/site";

export const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Suinance · The validator program for Sui." };

/** Per-page metadata with a self-referencing canonical URL and matching social cards. */
export function pageMeta(path: string, title: string, description: string, opts: { index?: boolean } = {}): Metadata {
  const full = `${title} · ${site.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, url: path, title: full, description, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: full, description, images: [OG_IMAGE.url] },
    ...(opts.index === false ? { robots: { index: false, follow: false } } : {}),
  };
}
