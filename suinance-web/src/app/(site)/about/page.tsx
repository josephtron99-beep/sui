import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ArrowUpRight } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/button";
import { Reveal, TiltCard } from "@/components/ui/motion";
import { PageHero } from "@/components/site/page-hero";
import { LogoCoin3D } from "@/components/three/scenes";
import { site } from "@/config/site";

export const metadata: Metadata = pageMeta("/about", "About Us", "Suinance is an independent validator program for Sui. Learn our mission, the principles behind the program and how we stay independent from Mysten Labs.");

const principles = [
  { n: "01", title: "Rules in the open", body: "Every program criterion is published. Operators know exactly what is checked and why." },
  { n: "02", title: "Proof over promises", body: "We judge validators on on-chain data anyone can verify, not on claims or marketing." },
  { n: "03", title: "Decentralisation first", body: "The program favours strong mid-sized operators so voting power spreads across the network." },
  { n: "04", title: "No custody, ever", body: "Suinance never holds SUI or keys. Operators run their own nodes and delegators stake from their own wallets." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Suinance"
        title="A higher standard for Sui validators"
        description="Suinance runs an independent validator program: public criteria, checks every epoch and a shared home for the operators who keep Sui running."
        aside={<LogoCoin3D className="mx-auto aspect-square w-full max-w-[300px] sm:max-w-[400px]" />}
        ticker={["Rules in the open", "Proof over promises", "Decentralisation first", "No custody", "Independent"]}
      />

      <Section className="border-t-[1.5px] border-ink">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionHeading eyebrow="Mission" title="Why we built Suinance" />
          </Reveal>
          <Reveal delay={0.1} className="grid gap-5 text-[17px]">
            <p>
              Sui runs on its validators. Every transaction, every checkpoint and every protocol upgrade depends on independent operators doing
              their job well, epoch after epoch.
            </p>
            <p>
              Good operators deserve to be found, and SUI holders deserve a clear way to find them. The Suinance Validator Program sets a public
              bar, checks it with on-chain data every epoch and brings the operators who meet it together in one place.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section className="surface-dark bg-ink text-paper">
        <Container className="grid gap-12">
          <Reveal>
            <h2 className="text-[clamp(28px,3.6vw,44px)] font-extrabold">
              What we <span className="text-yellow">stand for</span>
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.06}>
                <TiltCard className="h-full">
                  <div className="grid h-full content-start gap-4 rounded-card border-[1.5px] border-paper/20 p-7 transition-colors hover:border-yellow">
                    <span className="font-mono text-sm text-yellow">{p.n}</span>
                    <h3 className="text-2xl font-bold">{p.title}</h3>
                    <p className="text-paper/70">{p.body}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="grid h-full content-start gap-4 rounded-card border-[1.5px] border-ink bg-yellow p-8">
              <h2 className="text-3xl font-extrabold">Independent by design</h2>
              <p className="text-ink/80">
                Suinance is an independent program. It is not run by or affiliated with Mysten Labs or the Sui Foundation. Sui and SUI are used
                here only to describe the network.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid h-full content-start gap-4 rounded-card border-[1.5px] border-ink p-8">
              <h2 className="text-3xl font-extrabold">Get in touch</h2>
              <p className="text-muted">Questions about the program or an application? Reach the team directly.</p>
              <div className="flex flex-wrap gap-3">
                {site.supportEmail && (
                  <LinkButton href={`mailto:${site.supportEmail}`} external>
                    Email us <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </LinkButton>
                )}
                <LinkButton href="/faq" variant="outline">
                  Read the FAQ
                </LinkButton>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
