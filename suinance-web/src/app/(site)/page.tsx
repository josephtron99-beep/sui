import type { Metadata } from "next";
import { OG_IMAGE } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Handshake, Radar } from "lucide-react";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/button";
import { Magnetic, Reveal, SplitWords, TiltCard } from "@/components/ui/motion";
import { LogoCoin3D, Network3D } from "@/components/three/scenes";
import { LiveStats } from "@/components/site/live-stats";
import { Steps } from "@/components/site/steps";
import { Accordion } from "@/components/site/accordion";
import { safeNetworkSnapshot } from "@/lib/sui/network";
import { keyFacts } from "@/content/sui";
import { eligibility, programFaqs, programSteps } from "@/content/program";
import { formatNumber } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Suinance · The Validator Program for Sui" },
  description:
    "An independent validator program for Sui: public on-chain standards, checks every epoch and introductions to SUI delegators. Apply with your validator.",
  alternates: { canonical: "/" },
  openGraph: { url: "/", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
};

const pillars = [
  {
    icon: BadgeCheck,
    title: "Public standards",
    body: "Commission, peer reports, software version and voting power. Every rule is written down and checked with on-chain data.",
  },
  {
    icon: Radar,
    title: "Checked every epoch",
    body: "Each member's record is reviewed at every epoch boundary, so the program badge always reflects how a validator runs today.",
  },
  {
    icon: Handshake,
    title: "Reach real delegators",
    body: "Members are introduced to the Suinance community of SUI holders, who choose where to stake from their own wallets.",
  },
];

export default async function HomePage() {
  const snap = await safeNetworkSnapshot();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 sm:pt-32">
        <div aria-hidden className="bg-grid bg-grid-fade absolute inset-0 -z-10" />
        <Container className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="grid gap-7 pt-6 lg:pt-0">
            <Reveal>
              <Eyebrow>Suinance Validator Program · Sui mainnet</Eyebrow>
            </Reveal>
            <h1 className="text-[clamp(38px,5vw,66px)] font-extrabold leading-[1.02]">
              <SplitWords text="Validators that" />
              <br />
              <span className="highlight">
                <SplitWords text="keep Sui strong." delay={0.18} />
              </span>
            </h1>
            <Reveal delay={0.35}>
              <p className="max-w-[52ch] text-base text-muted sm:text-lg">
                Suinance is an independent program for Sui validator operators. We set public standards, check every member&apos;s on-chain
                record each epoch and connect well-run validators with the SUI holders who secure the network.
              </p>
            </Reveal>
            <Reveal delay={0.45} className="flex flex-wrap items-center gap-3">
              <Magnetic>
                <LinkButton href="/program#apply" size="lg">
                  Apply as a validator <ArrowUpRight className="h-5 w-5" aria-hidden />
                </LinkButton>
              </Magnetic>
              <LinkButton href="/program" variant="outline" size="lg">
                How the program works
              </LinkButton>
            </Reveal>
            <Reveal delay={0.55}>
              <ul className="flex flex-wrap gap-2" aria-label="Program at a glance">
                {["Public criteria", "Checked every epoch", "No fee to join", "Independent operators"].map((t) => (
                  <li
                    key={t}
                    className="flex items-center gap-2 rounded-full border border-line bg-paper/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted backdrop-blur"
                  >
                    <svg viewBox="0 0 100 100" className="h-2.5 w-2.5" aria-hidden>
                      <path d="M50 4 90 27v46L50 96 10 73V27z" fill="var(--yellow-2)" stroke="var(--ink)" strokeWidth="8" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={0.2} y={0}>
            <LogoCoin3D className="mx-auto aspect-square w-full max-w-[340px] sm:max-w-[440px]" />
          </Reveal>
        </Container>
        <Container className="relative pb-6">
          <Reveal delay={0.5}>
            <LiveStats snap={snap} />
          </Reveal>
        </Container>
      </section>

      {/* Pillars */}
      <Section>
        <Container className="grid gap-12">
          <Reveal>
            <SectionHeading
              eyebrow="Why the program"
              title={
                <>
                  A higher bar for <span className="underline-yellow">Sui validators</span>
                </>
              }
              description="Sui is only as strong as the operators who run it. The program rewards the ones who run it well, and shows the proof."
            />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <TiltCard className="h-full">
                  <div className="group grid h-full content-start gap-5 rounded-card border-[1.5px] border-ink bg-paper p-7 transition-shadow duration-300 hover:shadow-hard">
                    <span className="grid h-12 w-12 place-items-center rounded-xl border-[1.5px] border-ink bg-yellow transition-transform duration-300 group-hover:-rotate-6">
                      <p.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="text-2xl font-bold">{p.title}</h3>
                    <p className="text-muted">{p.body}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section className="border-y-[1.5px] border-ink bg-yellow-wash">
        <Container className="grid gap-16">
          <Reveal>
            <SectionHeading eyebrow="How it works" title="Four steps from application to member" />
          </Reveal>
          <Steps steps={programSteps} />
          <Reveal>
            <LinkButton href="/program#apply" variant="primary" size="lg" className="w-fit">
              Start your application <ArrowRight className="h-5 w-5" aria-hidden />
            </LinkButton>
          </Reveal>
        </Container>
      </Section>

      {/* Validator network */}
      <Section className="overflow-hidden">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal y={0} className="order-2 lg:order-1">
            <Network3D className="mx-auto aspect-square w-full max-w-[520px]" />
          </Reveal>
          <div className="order-1 grid gap-6 lg:order-2">
            <Reveal>
              <SectionHeading
                eyebrow="The validator set"
                title="Built for a decentralised Sui"
                description={
                  snap
                    ? `${snap.validatorCount} validators secure Sui right now, holding ${formatNumber(snap.totalStakeSui / 1e9, 2)} billion staked SUI between them. The program favours strong mid-sized operators, so stake and voting power spread more evenly across the set.`
                    : "The program favours strong mid-sized operators, so stake and voting power spread more evenly across the validator set."
                }
              />
            </Reveal>
            <Reveal delay={0.1}>
              <LinkButton href="/validators" variant="outline" size="lg" className="w-fit">
                Explore the validator set <ArrowRight className="h-5 w-5" aria-hidden />
              </LinkButton>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Standards */}
      <Section className="surface-dark bg-ink text-paper">
        <Container className="grid gap-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="grid gap-4">
              <Reveal>
                <Eyebrow className="text-paper/60">Eligibility</Eyebrow>
              </Reveal>
              <Reveal>
                <h2 className="text-[clamp(28px,3.6vw,44px)] font-extrabold">
                  The standards, <span className="text-yellow">in numbers</span>
                </h2>
              </Reveal>
            </div>
            <Reveal>
              <Link href="/program#criteria" className="group inline-flex items-center gap-2 py-2 font-medium text-paper">
                Full criteria
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {eligibility.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.05}>
                <div className="grid h-full content-start gap-2 rounded-card border-[1.5px] border-paper/20 p-5 transition-colors hover:border-yellow sm:p-6">
                  <span className="font-display text-[clamp(28px,3.6vw,44px)] font-extrabold leading-none text-yellow">{c.value}</span>
                  <span className="font-medium">{c.title}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Why Sui */}
      <Section>
        <Container className="grid gap-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <SectionHeading eyebrow="Why Sui" title="A fast network built around objects" />
            </Reveal>
            <Reveal>
              <Link href="/learn" className="group inline-flex items-center gap-2 py-2 font-medium">
                Read the Sui guide
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {keyFacts.map((f, i) => (
              <Reveal key={f.label} delay={i * 0.06}>
                <div className="grid h-full gap-2 rounded-card border-[1.5px] border-ink p-6">
                  <span className="font-display text-[clamp(28px,3.6vw,44px)] font-extrabold leading-none">{f.value}</span>
                  <span className="text-sm text-muted">{f.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section className="pt-0">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <SectionHeading eyebrow="Questions" title="Before you apply" />
          </Reveal>
          <Reveal delay={0.1} className="grid gap-6">
            <Accordion items={programFaqs.slice(0, 5)} />
            <Link href="/faq" className="group inline-flex w-fit items-center gap-2 py-2 font-medium">
              All questions
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </Reveal>
        </Container>
      </Section>

      {/* CTA */}
      <section className="px-3 pb-16 sm:px-5">
        <Reveal>
          <div className="relative mx-auto grid max-w-[1240px] gap-8 overflow-hidden rounded-[28px] border-[1.5px] border-ink bg-yellow px-6 py-14 sm:px-12 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div aria-hidden className="bg-grid absolute inset-0 opacity-40 mix-blend-multiply" />
            <div className="relative grid gap-4">
              <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold">Run a Sui validator?</h2>
              <p className="max-w-[46ch] text-lg text-ink/75">Apply with your validator&apos;s address. We check the record on mainnet and reply by email.</p>
            </div>
            <div className="relative flex flex-wrap gap-3 lg:justify-end">
              <LinkButton href="/program#apply" size="lg">
                Apply now <ArrowUpRight className="h-5 w-5" aria-hidden />
              </LinkButton>
              <LinkButton href="/register" variant="outline" size="lg">
                Create account
              </LinkButton>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
