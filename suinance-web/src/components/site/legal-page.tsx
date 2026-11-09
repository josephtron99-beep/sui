import { Container } from "@/components/ui/primitives";
import { PageHero } from "@/components/site/page-hero";

export type LegalSection = { heading: string; body: (string | string[])[] };

export function LegalPage({ eyebrow, title, intro, updated, sections }: { eyebrow: string; title: string; intro: string; updated: string; sections: LegalSection[] }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={intro} compact />
      <Container className="pt-12 pb-24 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Last updated · {updated}</p>
          <div className="grid max-w-[72ch] gap-10">
            {sections.map((s, i) => (
              <section key={s.heading} className="grid gap-3">
                <h2 className="text-2xl font-bold">
                  <span className="mr-3 font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                  {s.heading}
                </h2>
                {s.body.map((b, j) =>
                  Array.isArray(b) ? (
                    <ul key={j} className="grid gap-2 pl-5 text-[16px] text-ink-2 [list-style:square]">
                      {b.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j} className="text-[16px] text-ink-2">
                      {b}
                    </p>
                  ),
                )}
              </section>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
