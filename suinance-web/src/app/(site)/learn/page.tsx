import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ArrowRight } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/motion";
import { PageHero } from "@/components/site/page-hero";
import { LearnVisual } from "@/components/site/hero-visuals";
import { Steps } from "@/components/site/steps";
import { ConsensusDag, ModelToggle, TechGrid, TokenDonut, UseCaseTabs } from "@/components/learn/interactive";
import { chainComparison, founders, keyFacts, stakingBasics, techCards, tokenomics, useCases } from "@/content/sui";

export const metadata: Metadata = pageMeta("/learn", "Learn Sui: How the Sui Blockchain Works", "A visual guide to Sui: the object model, Move, Mysticeti consensus, SUI tokenomics, what SUI is used for and how staking rewards work.");

const chapters = [
  { id: "what", label: "What is Sui" },
  { id: "consensus", label: "Consensus" },
  { id: "tokenomics", label: "Tokenomics" },
  { id: "uses", label: "Uses" },
  { id: "compare", label: "Compare" },
  { id: "team", label: "Team" },
  { id: "staking", label: "Staking" },
];

function Chapter({ id, n, title, intro, children }: { id: string; n: number; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t-[1.5px] border-ink py-16 sm:py-24">
      <Container className="grid gap-10">
        <Reveal>
          <SectionHeading eyebrow={`Chapter 0${n}`} title={title} description={intro} />
        </Reveal>
        <Reveal delay={0.08}>{children}</Reveal>
      </Container>
    </section>
  );
}

export default function LearnPage() {
  return (
    <>
      <PageHero
        eyebrow="Learn Sui"
        title="The Sui blockchain, explained"
        description="How Sui works, who built it, how the SUI token is set up and how staking rewards are earned. Tap and play with each chapter."
        aside={<LearnVisual />}
        ticker={["Object model", "Move language", "Mysticeti consensus", "10B max supply", "zkLogin", "Sponsored transactions", "Epochs"]}
      >
        <nav aria-label="Chapters" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pt-2 lg:flex-wrap lg:overflow-visible">
          {chapters.map((c, i) => (
            <a key={c.id} href={`#${c.id}`} className="shrink-0 rounded-full border-[1.5px] border-ink bg-paper px-4 py-2 text-sm transition hover:bg-yellow">
              <span className="mr-1.5 font-mono text-[11px] text-muted">0{i + 1}</span>
              {c.label}
            </a>
          ))}
        </nav>
      </PageHero>

      <Chapter id="what" n={1} title="What is Sui?">
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="grid max-w-[62ch] gap-4 text-[17px]">
            <p>
              Sui is a Layer 1 blockchain built by Mysten Labs for fast, low-cost apps such as games, payments and DeFi. Mainnet went live in May
              2023.
            </p>
            <p>
              Most blockchains store data in accounts and process transactions one after another. Sui stores everything as <strong>objects</strong>:
              coins, NFTs and game items each have an owner and a version. Transactions that touch different objects don&apos;t conflict, so Sui can
              run them in parallel.
            </p>
            <p>
              Smart contracts are written in <strong>Move</strong>, a language designed to keep digital assets safe. An asset can&apos;t be copied or
              lost by accident.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {keyFacts.map((f) => (
                <div key={f.label} className="rounded-xl border border-line p-4">
                  <span className="block font-display text-2xl font-extrabold">{f.value}</span>
                  <span className="text-[13px] text-muted">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ModelToggle />
        </div>
      </Chapter>

      <Chapter
        id="consensus"
        n={2}
        title="Consensus and technology"
        intro="Sui uses delegated proof of stake. Validators, weighted by the SUI staked with them, agree on the order of transactions using Mysticeti, a DAG-based consensus protocol."
      >
        <div className="grid gap-6">
          <ConsensusDag />
          <TechGrid items={techCards} />
        </div>
      </Chapter>

      <Chapter
        id="tokenomics"
        n={3}
        title="SUI tokenomics"
        intro="SUI has a fixed maximum supply of 10 billion tokens, and no more can ever be minted. Tokens unlock gradually on a published schedule. Select a share to see what it is for."
      >
        <div className="grid gap-8">
          <TokenDonut items={tokenomics} />
          <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-ink/20 pt-5 text-[15px]">
            <span className="rounded-full bg-yellow-soft px-3 py-1 font-mono text-sm">1 SUI = 1,000,000,000 MIST</span>
            <span className="text-muted">Gas fees are priced in MIST, Sui&apos;s smallest unit.</span>
          </div>
        </div>
      </Chapter>

      <Chapter id="uses" n={4} title="What SUI is used for">
        <UseCaseTabs items={useCases} />
      </Chapter>

      <Chapter
        id="compare"
        n={5}
        title="Sui and other fast networks"
        intro="Sui is one of several high-performance Layer 1 networks. Here is how it differs from the closest alternatives."
      >
        <div className="overflow-x-auto rounded-card border-[1.5px] border-ink">
          <table className="w-full min-w-[640px] text-left text-[15px]">
            <thead className="surface-dark bg-ink text-paper">
              <tr>
                {["Network", "Data model & language", "Consensus", "Native staking rate"].map((h) => (
                  <th key={h} scope="col" className="px-5 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chainComparison.map((c) => (
                <tr key={c.chain} className={c.chain === "Sui" ? "bg-yellow-wash font-medium" : "border-t border-line"}>
                  <th scope="row" className="px-5 py-4 font-display font-bold">
                    {c.chain}
                  </th>
                  <td className="px-5 py-4">{c.model}</td>
                  <td className="px-5 py-4">{c.consensus}</td>
                  <td className="px-5 py-4">{c.apy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[13px] text-muted">
          Rates on other networks are approximate public figures from late 2026 and change constantly. Sui&apos;s rate is lower than some
          networks because rewards come mostly from a fixed stake subsidy shared by a large amount of staked SUI.
        </p>
      </Chapter>

      <Chapter id="team" n={6} title="Founders and team" intro="Sui was built by Mysten Labs, founded in 2021 by former leads of Meta's Diem and Novi projects, where the Move language was first created.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {founders.map((f, i) => (
            <div key={f.name} className="grid content-start gap-3 rounded-card border-[1.5px] border-ink p-5">
              <span className={`grid h-12 w-12 place-items-center rounded-full font-display font-bold ${i % 2 ? "bg-yellow text-ink" : "surface-dark bg-ink text-yellow"}`}>
                {f.initials}
              </span>
              <h3 className="text-lg font-bold">{f.name}</h3>
              <span className="w-fit rounded bg-yellow-soft px-1.5 text-[12.5px] font-semibold">{f.role}</span>
              <p className="text-sm text-muted">{f.bio}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-card bg-yellow-wash p-6">
            <h3 className="text-lg font-bold">Mysten Labs</h3>
            <p className="text-[15px] text-muted">The company that builds Sui&apos;s core software and products such as Walrus, Seal and Nautilus.</p>
          </div>
          <div className="rounded-card bg-yellow-wash p-6">
            <h3 className="text-lg font-bold">Sui Foundation</h3>
            <p className="text-[15px] text-muted">A non-profit that funds ecosystem growth through grants, education and community programs.</p>
          </div>
        </div>
      </Chapter>

      <Chapter id="staking" n={7} title="How staking works on Sui" intro="Staking is how SUI holders help secure the network and earn a share of the rewards it pays.">
        <div className="grid gap-12">
          <Steps steps={stakingBasics} />
          <LinkButton href="/stake" size="lg" className="w-fit">
            Start staking <ArrowRight className="h-5 w-5" aria-hidden />
          </LinkButton>
        </div>
      </Chapter>

      <Section className="border-t-[1.5px] border-ink py-10 sm:py-12">
        <Container>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Sources: docs.sui.io, Sui Foundation, Mysten Labs announcements · Facts as of November 2026
          </p>
        </Container>
      </Section>
    </>
  );
}
