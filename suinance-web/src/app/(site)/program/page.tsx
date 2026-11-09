import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { ArrowRight, ArrowUpRight, BadgeCheck, Eye, Handshake, Radio } from "lucide-react";
import { pageMeta } from "@/lib/seo";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/button";
import { Reveal, TiltCard } from "@/components/ui/motion";
import { PageHero } from "@/components/site/page-hero";
import { ProgramVisual } from "@/components/site/hero-visuals";
import { Steps } from "@/components/site/steps";
import { Accordion } from "@/components/site/accordion";
import { ApplyForm } from "@/components/program/apply-form";
import { ApplicationList } from "@/components/program/application-list";
import { EligibilityChecker, type CheckerEntry } from "@/components/program/eligibility-checker";
import { checkValidator, summarize } from "@/lib/program-check";
import { safeNetworkSnapshot } from "@/lib/sui/network";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb, schema } from "@/db";
import { eligibility, programBenefits, programFaqs, programRules, programSteps } from "@/content/program";

export const metadata: Metadata = pageMeta(
  "/program",
  "Sui Validator Program: Criteria, Benefits & How to Apply",
  "Join the Suinance Validator Program for Sui operators: public criteria, a live eligibility checker, checks every epoch and introductions to SUI delegators.",
);

const benefitIcons = [BadgeCheck, Handshake, Eye, Radio];

async function myApplications(userId: string) {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(schema.validatorApplications)
      .where(eq(schema.validatorApplications.userId, userId))
      .orderBy(desc(schema.validatorApplications.createdAt));
  } catch {
    return [];
  }
}

export default async function ProgramPage() {
  const [snap, user] = await Promise.all([safeNetworkSnapshot(), getCurrentUser()]);
  const applications = user ? await myApplications(user.id) : [];
  const checker: CheckerEntry[] = (snap?.validators ?? []).map((v) => {
    const results = checkValidator(v);
    return { name: v.name, address: v.address, results, failed: summarize(results).failed };
  });
  const eligibleCount = checker.filter((c) => c.failed === 0).length;

  return (
    <>
      <PageHero
        eyebrow="Validator Program"
        title="The Suinance Validator Program"
        description="An open standard for Sui validator operators. Meet public criteria, get checked every epoch and reach the SUI holders who choose who secures the network."
        aside={<ProgramVisual validatorCount={snap?.validatorCount ?? null} epoch={snap?.epoch ?? null} />}
        ticker={["Public criteria", "Checked every epoch", `Commission ≤ ${programRules.maxCommissionPct}%`, "No fee to join", "Independent operators", "Sui mainnet"]}
      >
        <div className="flex flex-wrap gap-3">
          <LinkButton href="#apply" size="lg">
            Apply now <ArrowUpRight className="h-5 w-5" aria-hidden />
          </LinkButton>
          <LinkButton href="#criteria" variant="outline" size="lg">
            See the criteria
          </LinkButton>
        </div>
      </PageHero>

      {/* Overview */}
      <Section className="border-t-[1.5px] border-ink">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionHeading eyebrow="Overview" title="A program built around on-chain proof" />
          </Reveal>
          <Reveal delay={0.1} className="grid gap-5 text-[17px]">
            <p>
              Sui is secured by its validators. The more independent, well-run operators there are, the stronger and more decentralised the
              network becomes.
            </p>
            <p>
              The Suinance Validator Program brings those operators together. Every rule is public, every check uses on-chain data anyone can
              verify, and members are introduced to the SUI holders who decide where stake goes.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* Benefits */}
      <Section className="pt-0">
        <Container className="grid gap-12">
          <Reveal>
            <SectionHeading eyebrow="What members get" title="Why operators join" />
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {programBenefits.map((b, i) => {
              const Icon = benefitIcons[i % benefitIcons.length];
              return (
                <Reveal key={b.title} delay={i * 0.06}>
                  <TiltCard className="h-full">
                    <div className="group grid h-full content-start gap-4 rounded-card border-[1.5px] border-ink bg-paper p-6 transition-shadow duration-300 hover:shadow-hard">
                      <span className="grid h-11 w-11 place-items-center rounded-xl border-[1.5px] border-ink bg-yellow transition-transform duration-300 group-hover:-rotate-6">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <h3 className="text-xl font-bold">{b.title}</h3>
                      <p className="text-[15px] text-muted">{b.body}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Criteria */}
      <Section id="criteria" className="surface-dark scroll-mt-20 bg-ink text-paper">
        <Container className="grid gap-12">
          <Reveal>
            <SectionHeading
              eyebrow="Eligibility"
              title={
                <>
                  Six standards, <span className="text-yellow">all on-chain</span>
                </>
              }
              description="Modelled on established validator programs and Sui's own validator rules. Each one can be checked on a public explorer."
              className="[&_p]:text-paper/70"
            />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eligibility.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.05}>
                <div className="grid h-full content-start gap-3 rounded-card border-[1.5px] border-paper/20 p-6 transition-colors hover:border-yellow">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-[clamp(30px,3.4vw,40px)] font-extrabold leading-none text-yellow">{c.value}</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/50">{c.label}</span>
                  </div>
                  <h3 className="text-xl font-bold">{c.title}</h3>
                  <p className="text-[15px] text-paper/70">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section className="border-b-[1.5px] border-ink bg-yellow-wash">
        <Container className="grid gap-16">
          <Reveal>
            <SectionHeading eyebrow="How it works" title="From application to member" />
          </Reveal>
          <Steps steps={programSteps} />
        </Container>
      </Section>

      {/* Checker */}
      {checker.length > 0 && (
        <Section id="check" className="scroll-mt-20">
          <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <SectionHeading
                eyebrow="Check your validator"
                title="See where you stand in seconds"
                description={`Search any active Sui validator to run the program checks against live mainnet data. Right now ${eligibleCount} of ${checker.length} active validators meet every automatic check.`}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <EligibilityChecker entries={checker} />
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Apply */}
      <Section id="apply" className="scroll-mt-20 border-t-[1.5px] border-ink">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid content-start gap-6">
            <Reveal>
              <SectionHeading
                eyebrow="Apply"
                title="Apply with your validator"
                description="It takes about two minutes. We use your validator's Sui address to check its record directly on mainnet."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="grid gap-2 text-[15px] text-muted">
                {["No fee to apply or to stay", "One application per validator address", "We reply to the email on your account"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="grid gap-6">
            {user ? (
              <>
                {applications.length > 0 && <ApplicationList applications={applications} />}
                <ApplyForm maxCommissionPct={programRules.maxCommissionPct} />
              </>
            ) : (
              <div className="grid gap-5 rounded-card border-[1.5px] border-ink bg-yellow p-6 sm:p-8">
                <h3 className="text-2xl font-bold">Log in to apply</h3>
                <p className="text-ink/75">
                  Applications are linked to a verified Suinance account, so we can reach you about the review and keep your validator&apos;s
                  status in one place.
                </p>
                <div className="flex flex-wrap gap-3">
                  <LinkButton href="/login?next=/program%23apply" size="lg">
                    Log in <ArrowRight className="h-5 w-5" aria-hidden />
                  </LinkButton>
                  <LinkButton href="/register" variant="outline" size="lg">
                    Create account
                  </LinkButton>
                </div>
              </div>
            )}
          </Reveal>
        </Container>
      </Section>

      {/* FAQ */}
      <Section className="pt-0">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <SectionHeading eyebrow="Questions" title="About the program" />
          </Reveal>
          <Reveal delay={0.1}>
            <Accordion items={programFaqs} />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
