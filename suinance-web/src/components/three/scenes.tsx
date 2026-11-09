"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const LogoCoinScene = dynamic(() => import("./logo-coin-scene"), { ssr: false });
const NetworkScene = dynamic(() => import("./network-scene"), { ssr: false });

/** Tracks visibility so 3D canvases stop rendering when off screen. */
function useVisible<T extends Element>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible] as const;
}

let canRender3D: boolean | undefined;
function detect3D() {
  if (canRender3D === undefined) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
    canRender3D = webgl && !reduce;
  }
  return canRender3D;
}
const noopSubscribe = () => () => {};

/** null while server rendering, then true/false in the browser. */
function useCanRender3D(): boolean | null {
  return useSyncExternalStore(noopSubscribe, detect3D, () => null);
}

export function LogoCoin3D({ className, orbit = true }: { className?: string; orbit?: boolean }) {
  const [ref, visible] = useVisible<HTMLDivElement>();
  const ok = useCanRender3D();
  return (
    <div ref={ref} className={cn("relative", className)}>
      {ok ? (
        <LogoCoinScene active={visible} orbit={orbit} />
      ) : ok === false ? (
        <div className="grid h-full place-items-center">
          <LogoMark className="h-1/2 w-auto text-ink" />
        </div>
      ) : null}
    </div>
  );
}

export function Network3D({ className, highlight }: { className?: string; highlight?: number }) {
  const [ref, visible] = useVisible<HTMLDivElement>();
  const ok = useCanRender3D();
  return (
    <div ref={ref} className={cn("relative", className)}>
      {ok ? <NetworkScene active={visible} highlight={highlight} /> : null}
    </div>
  );
}
