import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Activity, Percent, Scale, ShieldCheck } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { PageHero } from "@/components/site/page-hero";
import { LiveStats } from "@/components/site/live-stats";
import { ValidatorTable } from "@/components/site/validator-table";
import { Network3D } from "@/components/three/scenes";
import { nakamotoCoefficient, safeNetworkSnapshot } from "@/lib/sui/network";
import { checkValidator, summarize } from "@/lib/program-check";
import { formatNumber } from "@/lib/utils";
import { programRules } from "@/content/program";
import { LinkButton } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = pageMeta("/validators", "Sui Validator Set: Live Stake, Commission & Voting Power", "Every active Sui validator, live from mainnet: stake, voting power, commission and gas price quotes, with Suinance Validator Program members marked.");

const criteria = [
  { icon: Percent, title: "Commission", body: `Program members keep commission at ${programRules.maxCommissionPct}% or lower, and announce changes before they apply.` },
  { icon: Scale, title: "Voting power", body: `Members stay under ${programRules.maxVotingPowerPct}% of the network, so the program strengthens mid-sized operators.` },
  { icon: Activity, title: "Peer reports", body: `No tallying-rule reports from other validators in the last ${programRules.cleanEpochs} epochs.` },
  { icon: ShieldCheck, title: "Public identity", body: "Name, description, logo and website set on-chain, with a team that can be reached." },
];

export default async function ValidatorsPage() {
  const snap = await safeNetworkSnapshot();
  const decentral = snap
    ? (() => {
        const vs = snap.validators;
        const byPower = [...vs].sort((a, b) => b.votingPowerPct - a.votingPowerPct);
        const commissions = vs.map((v) => v.commissionPct).sort((a, b) => a - b);
        return [
          { value: String(nakamotoCoefficient(vs)), label: "Nakamoto coefficient", note: "Fewest validators that together hold over one third of voting power" },
          { value: `${formatNumber(byPower.slice(0, 10).reduce((s, v) => s + v.votingPowerPct, 0), 1)}%`, label: "Top 10 voting power", note: "Share held by the ten largest validators" },
          { value: `${formatNumber(commissions[Math.floor(commissions.length / 2)] ?? 0, 2)}%`, label: "Median commission", note: "Half of all validators charge this or less" },
          { value: String(vs.filter((v) => summarize(checkValidator(v)).eligible).length), label: "Meet program checks", note: "Active validators passing every automatic check" },
          { value: String(vs.filter((v) => v.reportedBy.length > 0).length), label: "Reported this epoch", note: "Validators flagged by peers under the tallying rule" },
          { value: String(vs.filter((v) => v.atRisk).length), label: "At risk", note: "Below Sui's minimum stake and facing removal" },
        ];
      })()
    : [];

  return (
    <>
      <PageHero
        eyebrow="Validators"
        title="The Sui validator set, live"
        description="Stake, voting power, commission and gas price quotes for every active Sui validator, updated from mainnet every few minutes. Program members carry a badge."
        aside={<Network3D className="mx-auto aspect-square w-full max-w-[300px] sm:max-w-[420px]" highlight={snap?.validatorCount ? Math.min(snap.validatorCount, 30) : 22} />}
        ticker={["Live from mainnet", "Voting power", "Commission", "Gas price quotes", "Program members", "Explorer links"]}
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

      {decentral.length > 0 && (
        <Section className="surface-dark bg-ink pt-16 text-paper">
          <Container className="grid gap-10">
            <Reveal>
              <SectionHeading
                eyebrow="Decentralisation"
                title={
                  <>
                    How spread out is <span className="text-yellow">Sui&apos;s power?</span>
                  </>
                }
                description="Computed live from this epoch's validator set. Healthier networks have a higher Nakamoto coefficient and a smaller top-10 share."
                className="[&_p]:text-paper/70"
              />
            </Reveal>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {decentral.map((d, i) => (
                <Reveal key={d.label} delay={i * 0.04}>
                  <div className="grid h-full content-start gap-2 rounded-card border-[1.5px] border-paper/20 p-5 transition-colors hover:border-yellow sm:p-6">
                    <span className="font-display text-[clamp(28px,3.6vw,44px)] font-extrabold leading-none text-yellow">{d.value}</span>
                    <span className="font-medium">{d.label}</span>
                    <span className="text-[13px] text-paper/60">{d.note}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section className="border-t-[1.5px] border-ink bg-yellow-wash">
        <Container className="grid gap-12">
          <Reveal>
            <SectionHeading eyebrow="Program standards" title="What a program member looks like" />
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
          <Reveal>
            <LinkButton href="/program#criteria" size="lg" className="w-fit">
              Read the full criteria <ArrowRight className="h-5 w-5" aria-hidden />
            </LinkButton>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
