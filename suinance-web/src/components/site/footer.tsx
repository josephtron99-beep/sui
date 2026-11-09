import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/primitives";
import { footerNav, mainNav, site } from "@/config/site";

export function Footer() {
  const socials = [
    {
      label: "Suinance on X",
      href: site.social.x,
      icon: <path d="M17.75 3h3.07l-6.71 7.67L22 21h-6.18l-4.84-6.33L5.44 21H2.37l7.18-8.2L2 3h6.34l4.37 5.78L17.75 3Zm-1.08 16.18h1.7L7.4 4.73H5.57l11.1 14.45Z" />,
    },
    {
      label: "Suinance on Telegram",
      href: site.social.telegram,
      icon: <path d="M21.94 4.3 18.9 18.63c-.23 1.01-.83 1.26-1.68.78l-4.63-3.41-2.23 2.15c-.25.25-.46.46-.94.46l.33-4.71 8.58-7.75c.37-.33-.08-.52-.58-.19L7.15 12.64 2.58 11.2c-.99-.31-1.01-.99.21-1.47l17.85-6.88c.83-.31 1.55.19 1.3 1.45Z" />,
    },
    {
      label: "Suinance on Medium",
      href: site.social.medium,
      icon: <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12Zm7.42 0c0 3.54-1.51 6.42-3.38 6.42S14.2 15.54 14.2 12s1.51-6.42 3.38-6.42 3.38 2.88 3.38 6.42ZM24 12c0 3.17-.53 5.75-1.19 5.75s-1.19-2.58-1.19-5.75.53-5.75 1.19-5.75S24 8.83 24 12Z" />,
    },
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
          <ul className="flex gap-3" aria-label="Social media">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="grid h-11 w-11 place-items-center rounded-full border-[1.5px] border-paper/25 text-paper/80 transition hover:-translate-y-0.5 hover:border-yellow hover:bg-yellow hover:text-[#111]"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
                    {s.icon}
                  </svg>
                </a>
              </li>
            ))}
          </ul>
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
        </nav>
      </Container>
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <Logo className="mx-auto -mb-[3%] h-auto w-[110%] max-w-none -translate-x-[4.5%] text-paper/[0.06]" />
      </div>
      <Container className="relative flex flex-col gap-2 border-t border-paper/10 py-6 text-[13px] text-paper/50 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Suinance</span>
        <span>Suinance Validator Program · data from Sui mainnet</span>
      </Container>
    </footer>
  );
}
