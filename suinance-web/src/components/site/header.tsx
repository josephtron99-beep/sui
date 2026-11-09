"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, Menu, X, UserRound } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";
import { mainNav } from "@/config/site";
import { ThemeToggle } from "@/components/site/theme";
import { cn } from "@/lib/utils";

type Me = { name: string } | null;

function useMe() {
  const [me, setMe] = useState<Me | undefined>(undefined);
  const pathname = usePathname();
  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => alive && setMe(d.user ?? null))
      .catch(() => alive && setMe(null));
    return () => {
      alive = false;
    };
  }, [pathname]);
  return me;
}

export function Header() {
  const pathname = usePathname();
  const me = useMe();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    setHidden(y > 240 && y > prev && !open);
  });

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => document.querySelector<HTMLElement>("#mobile-menu a")?.focus(), 350);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
        animate={{ y: hidden ? -110 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={cn(
            "mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 rounded-2xl border-[1.5px] px-3 pl-4 transition-[background-color,border-color,box-shadow] duration-300 sm:pl-5",
            scrolled || open
              ? "border-ink bg-paper/85 shadow-[0_12px_40px_-24px_rgb(17_17_17/0.45)] backdrop-blur-xl"
              : "border-transparent bg-transparent",
          )}
        >
          <Link href="/" className="flex shrink-0 items-center py-2" aria-label="Suinance home">
            <Logo className="h-7 sm:h-8" />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative block rounded-full px-4 py-2 text-[14.5px] transition-colors",
                      isActive(item.href) ? "text-ink" : "text-muted hover:text-ink",
                    )}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {isActive(item.href) && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-yellow"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {me === undefined ? (
              <span className="hidden h-9 w-20 sm:block" aria-hidden />
            ) : me ? (
              <Link href="/account" className={buttonClasses("outline", "sm", "hidden sm:inline-flex")}>
                <UserRound className="h-4 w-4" aria-hidden />
                {me.name.split(" ")[0]}
              </Link>
            ) : (
              <Link href="/login" className={buttonClasses("ghost", "sm", "hidden sm:inline-flex")}>
                Log in
              </Link>
            )}
            <Link href="/stake" className={buttonClasses("primary", "sm", "hidden sm:inline-flex")}>
              Start staking
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" aria-hidden />
            </Link>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border-[1.5px] border-ink bg-paper lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 bg-paper bg-grid pt-24 lg:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 44px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav aria-label="Mobile" className="flex h-full flex-col justify-between px-6 pb-10">
              <ul className="grid gap-1">
                {mainNav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05, duration: 0.5 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-baseline justify-between border-b border-line py-4 font-display text-3xl font-bold"
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      <span className={cn(isActive(item.href) && "underline-yellow")}>{item.label}</span>
                      <span className="font-mono text-xs text-muted">0{i + 1}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                className="grid gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {me ? (
                  <Link href="/account" className={buttonClasses("outline", "lg", "w-full")}>
                    My account
                  </Link>
                ) : (
                  <Link href="/login" className={buttonClasses("outline", "lg", "w-full")}>
                    Log in
                  </Link>
                )}
                <Link href="/stake" className={buttonClasses("primary", "lg", "w-full")}>
                  Start staking
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
