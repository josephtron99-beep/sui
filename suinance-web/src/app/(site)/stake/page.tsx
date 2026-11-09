import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ShieldCheck, Clock, Coins, Undo2 } from "lucide-react";
import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { PageHero } from "@/components/site/page-hero";
import { StakeVisual } from "@/components/site/hero-visuals";
import { Estimator } from "@/components/site/estimator";
import { StakeClient } from "@/components/stake/stake-client";
import { safeNetworkSnapshot } from "@/lib/sui/network";

export const revalidate = 300;

export const metadata: Metadata = pageMeta("/stake", "Stake SUI from Your Wallet", "Stake SUI natively from your own wallet in under a minute. Choose a validator, see the live staking rate, track your stakes and withdraw any time.");

const safety = [
  { icon: ShieldCheck, title: "Non-custodial", body: "Staking runs from your wallet. Your StakedSui object stays in your address." },
  { icon: Clock, title: "Active next epoch", body: "New stake starts earning at the next epoch boundary, about 24 hours away." },
  { icon: Coins, title: "Compounding rewards", body: "Rewards are added to the pool each epoch and compound until you withdraw." },
  { icon: Undo2, title: "Withdraw any time", body: "Unstaking returns your SUI and rewards in one transaction. No lock-up period." },
];

export default async function StakePage() {
  const snap = await safeNetworkSnapshot();

  return (
    <>
      <PageHero
        eyebrow="Stake"
        title="Stake SUI from your own wallet"
        description="Pick a validator, choose an amount and approve the transaction in your wallet. You stay in control the whole time."
        aside={<StakeVisual apyPct={snap?.networkApyPct ?? null} epoch={snap?.epoch ?? null} />}
        ticker={["Non-custodial", "Active next epoch", "Rewards every ~24h", "Withdraw any time", "Minimum 1 SUI"]}
      />

      <Section className="pt-12 sm:pt-16">
        <Container>
          <StakeClient />
        </Container>
      </Section>

      <Section className="border-y-[1.5px] border-ink bg-yellow-wash">
        <Container className="grid gap-12">
          <Reveal>
            <SectionHeading eyebrow="Good to know" title="How native staking protects you" />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {safety.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div className="grid h-full content-start gap-4 rounded-card border-[1.5px] border-ink bg-paper p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-yellow">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="text-[15px] text-muted">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionHeading
              eyebrow="Plan ahead"
              title="Estimate your rewards"
              description={
                <>
                  Rates change every epoch. Staking always carries risk, so please read the{" "}
                  <Link href="/risk-disclosure" className="underline underline-offset-4">
                    risk disclosure
                  </Link>{" "}
                  before you stake.
                </>
              }
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Estimator apyPct={snap?.networkApyPct ?? null} />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
