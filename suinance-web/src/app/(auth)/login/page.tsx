import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = pageMeta("/login", "Log in", "Suinance account: log in.", { index: false });

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string; next?: string }> }) {
  const { reset, next } = await searchParams;
  // Only same-site paths are allowed, so the link cannot send people to another site.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/account";
  return <LoginForm next={safeNext} notice={reset ? "Your password was updated. Log in with your new password." : undefined} />;
}
