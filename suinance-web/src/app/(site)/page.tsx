import type { Metadata } from "next";
import { OG_IMAGE } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, KeyRound, Layers, Timer } from "lucide-react";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/button";
import { Magnetic, Reveal, SplitWords, TiltCard } from "@/components/ui/motion";
import { LogoCoin3D, Network3D } from "@/components/three/scenes";
import { LiveStats } from "@/components/site/live-stats";
import { Steps } from "@/components/site/steps";
import { Estimator } from "@/components/site/estimator";
import { Accordion } from "@/components/site/accordion";
import { safeNetworkSnapshot } from "@/lib/sui/network";
import { faqs, keyFacts, stakingBasics } from "@/content/sui";
import { formatNumber } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Suinance · Stake SUI with Curated Validators, Keep Your Keys" },
  description:
    "Stake SUI natively with a curated group of Sui validators. Non-custodial, live staking rates, rewards every epoch, withdraw any time. Learn how Sui works.",
  alternates: { canonical: "/" },
  openGraph: { url: "/", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
};

const pillars = [
  {
    icon: KeyRound,
    title: "Your keys, your SUI",
    body: "You stake from your own wallet. The StakedSui object stays in your address, and no one else can move it.",
  },
  {
    icon: Layers,
    title: "Curated validators",
    body: "Compare commission, stake and performance for every validator, then spread your stake across the ones you trust.",
  },
  {
    icon: Timer,
    title: "Rewards every epoch",
    body: "Once active, your stake earns protocol rewards about every 24 hours. They compound automatically in the pool.",
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
              <Eyebrow>Independent Sui staking program</Eyebrow>
            </Reveal>
            <h1 className="text-[clamp(38px,5vw,66px)] font-extrabold leading-[1.02]">
              <SplitWords text="Stake SUI." />
              <br />
              <span className="highlight">
                <SplitWords text="Keep your keys." delay={0.18} />
              </span>
            </h1>
            <Reveal delay={0.35}>
              <p className="max-w-[50ch] text-base text-muted sm:text-lg">
                Suinance helps you stake SUI natively with a curated group of validators. Your coins never leave your wallet, and rewards
                arrive every epoch.
              </p>
            </Reveal>
            <Reveal delay={0.45} className="flex flex-wrap items-center gap-3">
              <Magnetic>
                <LinkButton href="/stake" size="lg">
                  Start staking <ArrowUpRight className="h-5 w-5" aria-hidden />
                </LinkButton>
              </Magnetic>
              <LinkButton href="/learn" variant="outline" size="lg">
                Learn how Sui works
              </LinkButton>
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
              eyebrow="Why Suinance"
              title={
                <>
                  Staking that stays <span className="underline-yellow">in your hands</span>
                </>
              }
              description="Native Sui staking is safe by design. Suinance makes it simple to choose validators, see what you earn and stay in control."
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
            <SectionHeading eyebrow="How staking works" title="Four steps, about one day to your first reward" />
          </Reveal>
          <Steps steps={stakingBasics} />
          <Reveal>
            <LinkButton href="/stake" variant="primary" size="lg" className="w-fit">
              Go to staking <ArrowRight className="h-5 w-5" aria-hidden />
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
                eyebrow="Validator network"
                title="Choose who secures your stake"
                description={
                  snap
                    ? `${snap.validatorCount} validators secure Sui right now, holding ${formatNumber(snap.totalStakeSui / 1e9, 2)} billion staked SUI between them. See each one's commission, stake and estimated rate before you decide.`
                    : "See each validator's commission, stake and estimated rate before you decide."
                }
              />
            </Reveal>
            <Reveal delay={0.1}>
              <LinkButton href="/validators" variant="outline" size="lg" className="w-fit">
                Compare validators <ArrowRight className="h-5 w-5" aria-hidden />
              </LinkButton>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Estimator */}
      <Section className="surface-dark bg-ink text-paper">
        <Container className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-6">
            <Reveal>
              <Eyebrow className="text-paper/60">Plan your stake</Eyebrow>
            </Reveal>
            <Reveal>
              <h2 className="text-[clamp(28px,3.6vw,44px)] font-extrabold">
                See what your SUI <span className="text-yellow">could earn</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-[48ch] text-lg text-paper/70">
                Start from the live network rate, then adjust the amount and time. Sui rates are modest and change every epoch, so we show
                them honestly.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="text-ink">
            <Estimator apyPct={snap?.networkApyPct ?? null} />
          </Reveal>
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
            <SectionHeading eyebrow="Questions" title="Before you stake" />
          </Reveal>
          <Reveal delay={0.1} className="grid gap-6">
            <Accordion items={faqs.slice(1, 6)} />
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
              <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold">Put your SUI to work.</h2>
              <p className="max-w-[46ch] text-lg text-ink/75">Connect a Sui wallet, pick your validators and stake in under a minute.</p>
            </div>
            <div className="relative flex flex-wrap gap-3 lg:justify-end">
              <LinkButton href="/stake" size="lg">
                Start staking <ArrowUpRight className="h-5 w-5" aria-hidden />
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
