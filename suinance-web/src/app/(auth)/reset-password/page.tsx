import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ResetPasswordForm } from "@/components/auth/otp-forms";

export const metadata: Metadata = pageMeta("/reset-password", "Reset password", "Suinance account: reset password.", { index: false });

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return <ResetPasswordForm email={(email ?? "").trim().toLowerCase()} />;
}
