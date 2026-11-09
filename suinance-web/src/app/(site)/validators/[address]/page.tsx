import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { pageMeta } from "@/lib/seo";
import { Badge, Container, Section, SectionHeading } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/motion";
import { PageHero } from "@/components/site/page-hero";
import { CheckList } from "@/components/program/check-list";
import { safeNetworkSnapshot, type NetworkSnapshot } from "@/lib/sui/network";
import { checkValidator, summarize } from "@/lib/program-check";
import { formatNumber, shortAddress } from "@/lib/utils";

export const revalidate = 300;

type Props = { params: Promise<{ address: string }> };

function find(snap: NetworkSnapshot | null, address: string) {
  const a = address.toLowerCase();
  return snap?.validators.find((v) => v.address.toLowerCase() === a) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const v = find(await safeNetworkSnapshot(), address);
  if (!v) return pageMeta(`/validators/${address}`, "Validator not found", "This address is not in Sui's active validator set.", { index: false });
  return pageMeta(
    `/validators/${v.address}`,
    `${v.name}: Sui Validator Scorecard`,
    `Live scorecard for ${v.name} on Sui mainnet: stake, voting power, commission, gas price, peer reports and Suinance Validator Program checks.`,
  );
}

export default async function ValidatorScorecard({ params }: Props) {
  const { address } = await params;
  const snap = await safeNetworkSnapshot();
  const v = find(snap, address);
  if (!snap || !v) notFound();

  const results = checkValidator(v);
  const sum = summarize(results);
  const rank = snap.validators.findIndex((x) => x.address === v.address) + 1;
  const stakeChange = v.nextStakeSui - v.stakeSui;

  const stats: [string, string, string?][] = [
    ["Total stake", `${formatNumber(v.stakeSui, 0)} SUI`, `#${rank} of ${snap.validatorCount} by stake`],
    ["Voting power", `${formatNumber(v.votingPowerPct, 2)}%`, "Share of consensus votes"],
    ["Commission", `${formatNumber(v.commissionPct, 2)}%`, v.nextCommissionPct !== v.commissionPct ? `${formatNumber(v.nextCommissionPct, 2)}% from next epoch` : "Same next epoch"],
    ["Gas price quote", `${formatNumber(v.gasPrice)} MIST`, `Reference price: ${formatNumber(snap.referenceGasPrice)} MIST`],
    [
      "Stake next epoch",
      `${formatNumber(v.nextStakeSui, 0)} SUI`,
      stakeChange === 0 ? "No change scheduled" : `${stakeChange > 0 ? "+" : "−"}${formatNumber(Math.abs(stakeChange), 0)} SUI`,
    ],
    ["Pending in / out", `${formatNumber(v.pendingStakeSui, 0)} / ${formatNumber(v.pendingWithdrawSui, 0)}`, "SUI joining / leaving the pool"],
    ["Est. delegator rate", `${formatNumber(v.apyPct, 2)}%`, "From last epoch's rewards, after commission"],
    ["Active since", `Epoch ${v.activationEpoch}`, v.host ? `Node: ${v.host}` : undefined],
  ];

  return (
    <>
      <PageHero
        eyebrow="Validator scorecard"
        title={v.name}
        description={v.description || "No description set on-chain."}
        compact
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={sum.eligible ? "success" : "danger"}>
            {sum.eligible ? "Meets the automatic checks" : `${sum.failed} check${sum.failed > 1 ? "s" : ""} not met`}
          </Badge>
          {v.partner && <Badge tone="yellow">Program member</Badge>}
          <span className="font-mono text-[12px] text-muted">{shortAddress(v.address, 10)}</span>
        </div>
      </PageHero>

      <Section className="pt-12 sm:pt-16">
        <Container className="grid gap-12">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map(([k, val, note], i) => (
              <Reveal key={k} delay={i * 0.03}>
                <div className="grid h-full content-start gap-1 rounded-card border-[1.5px] border-ink p-4 sm:p-5">
                  <span className="text-[13px] text-muted">{k}</span>
                  <span className="break-words font-display text-[clamp(18px,2.2vw,26px)] font-extrabold tabular leading-tight">{val}</span>
                  {note && <span className="break-words text-[12.5px] text-muted">{note}</span>}
                </div>
              </Reveal>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <SectionHeading
                eyebrow="Program checks"
                title={`${sum.passed} of ${sum.total} checks passed`}
                description="Run live against this epoch's on-chain data. The full review also looks at the last 30 epochs and confirms the node's software version with the operator."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <CheckList results={results} />
            </Reveal>
          </div>

          <Reveal className="flex flex-wrap gap-3">
            <LinkButton href={`https://suiscan.xyz/mainnet/validator/${v.address}`} external variant="outline">
              View on Suiscan <ExternalLink className="h-4 w-4" aria-hidden />
            </LinkButton>
            {v.projectUrl && /^https?:\/\//.test(v.projectUrl) && (
              <LinkButton href={v.projectUrl} external variant="outline">
                Validator website <ExternalLink className="h-4 w-4" aria-hidden />
              </LinkButton>
            )}
            <LinkButton href="/validators" variant="ghost">
              <ArrowLeft className="h-4 w-4" aria-hidden /> All validators
            </LinkButton>
          </Reveal>
        </Container>
      </Section>

      <section className="px-3 pb-16 sm:px-5">
        <Reveal>
          <div className="mx-auto grid max-w-[1240px] gap-6 rounded-[28px] border-[1.5px] border-ink bg-yellow px-6 py-12 sm:px-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="grid gap-3">
              <h2 className="text-[clamp(24px,3.4vw,40px)] font-extrabold">Do you run {v.name}?</h2>
              <p className="max-w-[46ch] text-ink/75">Apply to the Suinance Validator Program with this address. We review the full on-chain record and reply by email.</p>
            </div>
            <div className="flex lg:justify-end">
              <LinkButton href="/program#apply" size="lg">
                Apply now <ArrowUpRight className="h-5 w-5" aria-hidden />
              </LinkButton>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
