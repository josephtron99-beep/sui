import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container, Section } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { PageHero } from "@/components/site/page-hero";
import { EcosystemVisual } from "@/components/site/hero-visuals";
import { EcosystemGrid } from "@/components/site/ecosystem-grid";
import { ecosystem } from "@/content/sui";

export const metadata: Metadata = pageMeta("/ecosystem", "Sui Ecosystem: Wallets, DeFi & Liquid Staking", "Explore the Sui ecosystem: Slush wallet, Walrus storage, DeepBook, Cetus, Suilend, liquid staking tokens, SuiNS and the best Sui block explorers.");

export default function EcosystemPage() {
  return (
    <>
      <PageHero
        eyebrow="Ecosystem"
        title="What you can do on Sui"
        description="Wallets, DeFi, liquid staking, storage and tools built on Sui. Suinance is not affiliated with these projects. Always do your own research before using any app."
        aside={<EcosystemVisual names={ecosystem.map((p) => p.name)} />}
        ticker={Array.from(new Set(ecosystem.map((p) => p.category)))}
      />
      <Section className="pt-14 sm:pt-20">
        <Container>
          <h2 className="sr-only">Projects on Sui</h2>
          <Reveal>
            <EcosystemGrid projects={ecosystem} />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
