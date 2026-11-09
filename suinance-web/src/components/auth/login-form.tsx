"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, PasswordInput } from "@/components/ui/form";
import { AuthCard, postJson } from "./shared";

export function LoginForm({ notice, next = "/account" }: { notice?: string; next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    setLoading(true);
    const res = await postJson("/api/auth/login", { email, password });
    setLoading(false);
    if (res.ok) {
      router.replace(next);
      router.refresh();
      return;
    }
    if (res.needsVerification) {
      router.push(`/verify-email?email=${encodeURIComponent(res.email ?? email)}&sent=1`);
      return;
    }
    setFields(res.fields ?? {});
    setError(res.message ?? "Could not log in.");
  }

  return (
    <AuthCard eyebrow="Welcome back" title="Log in to Suinance" description="Use the email and password you registered with.">
      {notice && <FormAlert tone="success">{notice}</FormAlert>}
      <form onSubmit={submit} className="grid gap-5" noValidate>
        <Field label="Email" htmlFor="email" error={fields.email}>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!fields.email} required />
        </Field>
        <Field label="Password" htmlFor="password" error={fields.password}>
          <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!fields.password} required />
        </Field>
        <div className="-mt-2 flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>
        {error && !Object.keys(fields).length && <FormAlert>{error}</FormAlert>}
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Log in
        </Button>
      </form>
      <p className="text-center text-[15px] text-muted">
        New to Suinance?{" "}
        <Link href="/register" className="font-medium text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
