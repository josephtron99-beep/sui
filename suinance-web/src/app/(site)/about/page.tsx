import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ArrowUpRight } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/button";
import { Reveal, TiltCard } from "@/components/ui/motion";
import { PageHero } from "@/components/site/page-hero";
import { LogoCoin3D } from "@/components/three/scenes";
import { site } from "@/config/site";

export const metadata: Metadata = pageMeta("/about", "About Us", "Suinance is an independent, non-custodial Sui staking program. Learn our mission, the principles we follow and how we stay independent from Mysten Labs.");

const principles = [
  { n: "01", title: "Custody stays with you", body: "Suinance never holds your SUI or your keys. Every stake and withdrawal is signed in your own wallet." },
  { n: "02", title: "Honest numbers", body: "We show the live network rate, label every estimate and never promise returns." },
  { n: "03", title: "Verifiable on-chain", body: "Every validator links to a public explorer, so you can check stake, commission and history yourself." },
  { n: "04", title: "Decentralisation first", body: "We encourage spreading stake across validators instead of piling it onto the largest ones." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Suinance"
        title="Staking made clear for every SUI holder"
        description="Suinance brings Sui staking into one simple place: learn how the network works, compare validators and stake from your own wallet."
        aside={<LogoCoin3D className="mx-auto aspect-square w-full max-w-[300px] sm:max-w-[400px]" />}
        ticker={["Custody stays with you", "Honest numbers", "Verifiable on-chain", "Decentralisation first", "Independent"]}
      />

      <Section className="border-t-[1.5px] border-ink">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionHeading eyebrow="Mission" title="Why we built Suinance" />
          </Reveal>
          <Reveal delay={0.1} className="grid gap-5 text-[17px]">
            <p>
              Staking is how SUI holders help secure the network and share in the rewards it pays. Yet choosing a validator, understanding epochs
              and knowing what you will earn is harder than it should be.
            </p>
            <p>
              Suinance puts it in one place. We explain Sui in plain language, show live data for every validator and let you stake natively,
              without handing your coins to anyone.
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
              <p className="text-muted">Questions about staking or validator partnerships? Reach the team directly.</p>
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
