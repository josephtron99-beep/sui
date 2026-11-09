import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container, Section } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { PageHero } from "@/components/site/page-hero";
import { Accordion } from "@/components/site/accordion";
import { faqs as suiFaqs } from "@/content/sui";
import { programFaqs } from "@/content/program";

const faqs = [...programFaqs, ...suiFaqs];

export const metadata: Metadata = pageMeta("/faq", "Sui Validator Program FAQ", "Answers about the Suinance Validator Program and Sui validators: who can apply, how reviews work, voting power, the tallying rule and how validators earn.");

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
      <PageHero eyebrow="FAQ" title="Questions, answered" description="About the Suinance Validator Program, and how validators work on Sui." compact />
      <Section className="pt-12 sm:pt-16">
        <Container className="max-w-[880px]">
          <h2 className="sr-only">Frequently asked questions</h2>
          <Reveal className="grid gap-4">
            <h3 className="font-mono text-[12px] uppercase tracking-[0.16em] text-muted">The program</h3>
            <Accordion items={programFaqs} />
          </Reveal>
          <Reveal className="mt-14 grid gap-4">
            <h3 className="font-mono text-[12px] uppercase tracking-[0.16em] text-muted">Sui validators</h3>
            <Accordion items={suiFaqs} defaultOpen={null} />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
