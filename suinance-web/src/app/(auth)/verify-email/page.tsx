import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { VerifyEmailForm } from "@/components/auth/otp-forms";

export const metadata: Metadata = pageMeta("/verify-email", "Verify email", "Suinance account: verify email.", { index: false });

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; sent?: string }> }) {
  const { email, sent } = await searchParams;
  return <VerifyEmailForm email={(email ?? "").trim().toLowerCase()} justSent={sent === "1"} />;
}
