import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Activity, Percent, Scale, ShieldCheck } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { PageHero } from "@/components/site/page-hero";
import { LiveStats } from "@/components/site/live-stats";
import { ValidatorTable } from "@/components/site/validator-table";
import { Network3D } from "@/components/three/scenes";
import { safeNetworkSnapshot } from "@/lib/sui/network";

export const revalidate = 300;

export const metadata: Metadata = pageMeta("/validators", "Sui Validators: Live Commission, Stake & APY", "Compare every active Sui validator live from mainnet: total stake, commission, voting power and estimated staking rate, with explorer links.");

const criteria = [
  { icon: Percent, title: "Commission", body: "The share of rewards the validator keeps. Lower commission means more of the rewards reach you." },
  { icon: Scale, title: "Stake and voting power", body: "Very large validators concentrate power. Spreading stake across mid-sized validators keeps Sui decentralised." },
  { icon: Activity, title: "Performance", body: "Validators that perform badly can be reported by their peers, which cuts the rewards paid to their pool." },
  { icon: ShieldCheck, title: "Track record", body: "Check how long a validator has been active, who runs it and how it communicates with stakers." },
];

export default async function ValidatorsPage() {
  const snap = await safeNetworkSnapshot();

  return (
    <>
      <PageHero
        eyebrow="Validators"
        title="Every Sui validator, side by side"
        description="Compare stake, commission and estimated staking rate for the full active validator set, updated from Sui mainnet every few minutes."
        aside={<Network3D className="mx-auto aspect-square w-full max-w-[300px] sm:max-w-[420px]" highlight={snap?.validatorCount ? Math.min(snap.validatorCount, 30) : 22} />}
        ticker={["Live from mainnet", "Stake", "Commission", "Voting power", "Estimated rate", "Explorer links"]}
      />

      <Container className="pt-10 pb-10">
        <Reveal>
          <LiveStats snap={snap} />
        </Reveal>
      </Container>

      <Section className="pt-6">
        <Container>
          {snap ? (
            <Reveal>
              <ValidatorTable validators={snap.validators} />
            </Reveal>
          ) : (
            <p className="rounded-card border-[1.5px] border-dashed border-ink/40 p-8 text-center text-muted">
              The validator list could not be loaded from Sui right now. Please refresh in a minute.
            </p>
          )}
        </Container>
      </Section>

      <Section className="border-t-[1.5px] border-ink bg-yellow-wash">
        <Container className="grid gap-12">
          <Reveal>
            <SectionHeading eyebrow="Choosing a validator" title="What to look for before you stake" />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {criteria.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.06}>
                <div className="grid h-full content-start gap-4 rounded-card border-[1.5px] border-ink bg-paper p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-yellow">
                    <c.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="text-lg font-bold">{c.title}</h3>
                  <p className="text-[15px] text-muted">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
