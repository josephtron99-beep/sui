import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { Reveal, SplitWords } from "@/components/ui/motion";
import { HeroBackdrop, HeroTicker } from "@/components/site/hero-backdrop";
import { cn } from "@/lib/utils";

/**
 * Page banner: a framed, yellow-washed panel with layered animated background,
 * breadcrumb, headline and an optional illustration on the right.
 * `compact` is used for text pages (FAQ, legal, account).
 */
export function PageHero({
  eyebrow,
  title,
  description,
  aside,
  children,
  ticker,
  compact = false,
  className,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  ticker?: string[];
  compact?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("px-3 pt-24 sm:px-5 sm:pt-28", className)}>
      <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[28px] border-[1.5px] border-ink bg-yellow-wash">
        <HeroBackdrop quiet={compact} />
        <Container
          className={cn(
            "relative grid items-center gap-10",
            compact ? "py-12 sm:py-16" : "py-14 sm:py-20 lg:min-h-[480px]",
            aside && "lg:grid-cols-[1.05fr_0.95fr]",
          )}
        >
          <div className="grid content-center gap-6">
            <Reveal>
              <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-3">
                <ol className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  <li>
                    <Link href="/" className="transition hover:text-ink">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden>
                    <ChevronRight className="h-3 w-3" />
                  </li>
                  <li aria-current="page" className="text-ink">
                    {eyebrow}
                  </li>
                </ol>
              </nav>
            </Reveal>
            <h1 className={cn("font-extrabold leading-[1.05]", compact ? "text-[clamp(32px,4.2vw,52px)]" : "text-[clamp(34px,4.6vw,58px)]")}>
              <SplitWords text={title} />
            </h1>
            <Reveal delay={0.2}>
              <p className="max-w-[56ch] text-base text-ink/70 sm:text-lg">{description}</p>
            </Reveal>
            {children && <Reveal delay={0.3}>{children}</Reveal>}
          </div>
          {aside && <div className="relative">{aside}</div>}
        </Container>
        {ticker && <HeroTicker items={ticker} />}
      </div>
    </section>
  );
}

