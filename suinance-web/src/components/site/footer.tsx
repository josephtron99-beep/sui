import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/primitives";
import { footerNav, mainNav, site } from "@/config/site";

export function Footer() {
  const socials = [
    { label: "X", href: site.social.x },
    { label: "Telegram", href: site.social.telegram },
    { label: "Discord", href: site.social.discord },
  ].filter((s) => s.href);

  return (
    <footer className="surface-dark relative overflow-hidden border-t-[1.5px] border-line bg-ink text-paper">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div className="grid content-start gap-5">
          <Logo className="h-9 text-yellow" />
          <p className="max-w-sm text-[15px] text-paper/70">{site.description}</p>
          <p className="max-w-sm text-[13px] text-paper/50">
            Suinance is independent. It is not run by or affiliated with Mysten Labs or the Sui Foundation.
          </p>
        </div>
        <nav aria-label="Footer site" className="grid content-start gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/50">Explore</span>
          {mainNav.map((l) => (
            <Link key={l.href} href={l.href} className="w-fit text-paper/80 transition hover:text-yellow">
              {l.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Footer legal" className="grid content-start gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/50">Help &amp; legal</span>
          {footerNav.map((l) => (
            <Link key={l.href} href={l.href} className="w-fit text-paper/80 transition hover:text-yellow">
              {l.label}
            </Link>
          ))}
          {site.supportEmail && (
            <a href={`mailto:${site.supportEmail}`} className="w-fit text-paper/80 transition hover:text-yellow">
              {site.supportEmail}
            </a>
          )}
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="w-fit text-paper/80 transition hover:text-yellow">
              {s.label}
            </a>
          ))}
        </nav>
      </Container>
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <Logo className="mx-auto -mb-[3%] h-auto w-[110%] max-w-none -translate-x-[4.5%] text-paper/[0.06]" />
      </div>
      <Container className="relative flex flex-col gap-2 border-t border-paper/10 py-6 text-[13px] text-paper/50 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Suinance</span>
        <span>Staking involves risk. Rewards are variable and not guaranteed.</span>
      </Container>
    </footer>
  );
}
