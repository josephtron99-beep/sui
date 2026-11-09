"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LogoMark } from "@/components/ui/logo";
import { Button, buttonClasses } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-grid grid min-h-dvh place-items-center px-6">
      <div className="grid max-w-md justify-items-center gap-5 text-center">
        <LogoMark className="h-16 text-ink" />
        <p className="font-mono text-sm text-muted">Something went wrong</p>
        <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold">We hit a snag loading this page.</h1>
        <p className="text-muted">Your funds are not affected. Please try again, or go back to the home page.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link href="/" className={buttonClasses("outline")}>
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
