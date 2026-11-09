"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const firstPath = useRef(true);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: { offset: -88 } });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Deep link such as /learn#consensus: wait for layout, then glide to the section.
      const t = setTimeout(() => {
        const el = document.querySelector(decodeURIComponent(hash));
        if (!el) return;
        if (lenisRef.current) lenisRef.current.scrollTo(el as HTMLElement, { offset: -88 });
        else el.scrollIntoView();
      }, 350);
      firstPath.current = false;
      return () => clearTimeout(t);
    }
    if (!firstPath.current) lenisRef.current?.scrollTo(0, { immediate: true });
    firstPath.current = false;
  }, [pathname]);

  return null;
}
