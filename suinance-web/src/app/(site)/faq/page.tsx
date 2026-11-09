import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container, Section } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { PageHero } from "@/components/site/page-hero";
import { Accordion } from "@/components/site/accordion";
import { faqs } from "@/content/sui";

export const metadata: Metadata = pageMeta("/faq", "Sui Staking FAQ", "Answers to common Sui staking questions: custody, when rewards start, how much you can earn, withdrawals, minimums and the risks of staking SUI.");

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }),
        }}
      />
      <PageHero eyebrow="FAQ" title="Questions, answered" description="Everything you need to know about staking SUI with Suinance." compact />
      <Section className="pt-12 sm:pt-16">
        <Container className="max-w-[880px]">
          <h2 className="sr-only">Frequently asked questions</h2>
          <Reveal>
            <Accordion items={faqs} />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
