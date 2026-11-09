import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Container, Section } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/motion";
import { PageHero } from "@/components/site/page-hero";
import { site } from "@/config/site";
import { AccountActions } from "./account-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMeta("/account", "My account", "Suinance account: my account.", { index: false });

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { welcome } = await searchParams;
  const country = new Intl.DisplayNames(["en"], { type: "region" }).of(user.country) ?? user.country;
  const referralLink = `${site.url.replace(/\/$/, "")}/register?ref=${user.referralCode}`;

  return (
    <>
      <PageHero
        eyebrow={welcome ? "Account created" : "My account"}
        title={welcome ? `Welcome, ${user.name.split(" ")[0]}` : `Hi, ${user.name.split(" ")[0]}`}
        description={welcome ? "Your email is verified and your account is ready. Connect a wallet to make your first stake." : "Your profile and referral details."}
        compact
      >
        <LinkButton href="/stake" size="lg">
          Go to staking <ArrowUpRight className="h-5 w-5" aria-hidden />
        </LinkButton>
      </PageHero>
      <Section className="pt-12 sm:pt-16">
        <Container className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="grid h-full content-start gap-5 rounded-card border-[1.5px] border-ink p-6 sm:p-8">
              <h2 className="text-2xl font-bold">Profile</h2>
              <dl className="grid gap-4">
                {[
                  ["Name", user.name],
                  ["Email", user.email],
                  ["Mobile", user.phone],
                  ["Country", country],
                  ["Member since", user.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })],
                ].map(([k, v]) => (
                  <div key={k} className="grid gap-0.5 border-b border-line pb-3 last:border-0">
                    <dt className="text-[13px] text-muted">{k}</dt>
                    <dd className="break-all font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grid h-full content-start gap-5 rounded-card border-[1.5px] border-ink bg-yellow p-6 sm:p-8">
              <h2 className="text-2xl font-bold">Your referral code</h2>
              <p className="text-ink/75">Share your code or link. New members can enter it when they register.</p>
              <AccountActions code={user.referralCode} link={referralLink} />
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
