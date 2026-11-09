"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, PasswordInput, PasswordStrength, Select } from "@/components/ui/form";
import { AuthCard, postJson } from "./shared";

export type CountryOption = { code: string; name: string; dial: string };

export function RegisterForm({
  countries,
  defaultCountry,
  defaultReferral,
}: {
  countries: CountryOption[];
  defaultCountry: string;
  defaultReferral: string;
}) {
  const router = useRouter();

  const initialCountry = countries.some((c) => c.code === defaultCountry) ? defaultCountry : "";
  const [form, setForm] = useState({ name: "", email: "", country: initialCountry, phone: "", referralCode: defaultReferral, password: "", acceptTerms: false });
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (fields[k]) setFields((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== k)));
  };

  const dial = form.country ? `+${countries.find((c) => c.code === form.country)?.dial ?? ""}` : "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    setLoading(true);
    const res = await postJson("/api/auth/register", form);
    setLoading(false);
    if (res.ok) {
      router.push(`/verify-email?email=${encodeURIComponent(res.email ?? form.email)}&sent=1`);
      return;
    }
    setFields(res.fields ?? {});
    setError(res.message ?? "Could not create your account.");
  }

  return (
    <AuthCard eyebrow="Create account" title="Join Suinance" description="We will email you a 6-digit code to confirm your address.">
      <form onSubmit={submit} className="grid gap-5" noValidate>
        <Field label="Full name" htmlFor="name" error={fields.name}>
          <Input id="name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} invalid={!!fields.name} required />
        </Field>
        <Field label="Email" htmlFor="email" error={fields.email}>
          <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} invalid={!!fields.email} required />
        </Field>
        <Field label="Country" htmlFor="country" error={fields.country}>
          <Select id="country" autoComplete="country" value={form.country} onChange={(e) => set("country", e.target.value)} invalid={!!fields.country} required>
            <option value="" disabled>
              Select your country
            </option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} (+{c.dial})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Mobile number" htmlFor="phone" error={fields.phone}>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[15px] text-muted">{dial || "+"}</span>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value.replace(/[^\d\s-]/g, ""))}
              invalid={!!fields.phone}
              className="pl-16"
              required
            />
          </div>
        </Field>
        <Field label="Password" htmlFor="password" error={fields.password}>
          <PasswordInput id="password" autoComplete="new-password" value={form.password} onChange={(e) => set("password", e.target.value)} invalid={!!fields.password} required />
        </Field>
        <PasswordStrength value={form.password} />
        <Field label="Referral code" htmlFor="referralCode" error={fields.referralCode} optional>
          <Input
            id="referralCode"
            autoComplete="off"
            value={form.referralCode}
            onChange={(e) => set("referralCode", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            invalid={!!fields.referralCode}
            maxLength={12}
            className="font-mono uppercase tracking-widest"
          />
        </Field>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.acceptTerms}
            onChange={(e) => set("acceptTerms", e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-ink"
            aria-invalid={!!fields.acceptTerms || undefined}
          />
          <span className="text-muted">
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="text-ink underline underline-offset-4">
              Terms of use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="text-ink underline underline-offset-4">
              Privacy policy
            </Link>
            , and I have read the{" "}
            <Link href="/risk-disclosure" target="_blank" className="text-ink underline underline-offset-4">
              Risk disclosure
            </Link>
            .
          </span>
        </label>
        {fields.acceptTerms && <p className="-mt-3 text-[13px] text-danger">{fields.acceptTerms}</p>}
        {error && <FormAlert>{error}</FormAlert>}
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
      <p className="text-center text-[15px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
