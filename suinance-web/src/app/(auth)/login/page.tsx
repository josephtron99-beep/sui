import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = pageMeta("/login", "Log in", "Suinance account: log in.", { index: false });

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const { reset } = await searchParams;
  return <LoginForm notice={reset ? "Your password was updated. Log in with your new password." : undefined} />;
}
