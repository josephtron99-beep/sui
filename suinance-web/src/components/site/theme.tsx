"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export type Theme = "light" | "dark";
const KEY = "suinance-theme";

/** Runs before first paint (inlined in <head>) so the page never flashes the wrong theme. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})();`;

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => {
    mo.disconnect();
    mq.removeEventListener("change", cb);
  };
}

function read(): Theme {
  const t = document.documentElement.dataset.theme;
  if (t === "dark" || t === "light") return t;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Current theme; `null` during server rendering. */
export function useTheme(): Theme | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  document.documentElement.style.colorScheme = t;
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* storage blocked: theme still applies for this visit */
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={theme ? `Switch to ${next} theme` : "Switch theme"}
      title={theme ? `Switch to ${next} theme` : "Switch theme"}
      className={cn(
        "relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border-[1.5px] border-ink bg-paper transition-colors hover:bg-yellow-soft",
        className,
      )}
    >
      <Sun className={cn("absolute h-[18px] w-[18px] transition-all duration-500", theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100")} aria-hidden />
      <Moon className={cn("absolute h-[18px] w-[18px] transition-all duration-500", theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0")} aria-hidden />
    </button>
  );
}
