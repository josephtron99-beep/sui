"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, OtpInput, PasswordInput, PasswordStrength } from "@/components/ui/form";
import { AuthCard, postJson } from "./shared";

function useCooldown(initial: number) {
  const [left, setLeft] = useState(initial);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return [left, setLeft] as const;
}

function ResendButton({ email, purpose, startCooldown }: { email: string; purpose: "verify_email" | "reset_password"; startCooldown: boolean }) {
  const [left, setLeft] = useCooldown(startCooldown ? 60 : 0);
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  return (
    <div className="grid gap-3">
      <p className="text-center text-[14px] text-muted">
        Didn&apos;t get it? Check spam, or{" "}
        <button
          type="button"
          disabled={left > 0 || loading || !email}
          onClick={async () => {
            setLoading(true);
            setMsg(null);
            const res = await postJson("/api/auth/resend-otp", { email, purpose });
            setLoading(false);
            if (res.ok) {
              setMsg({ tone: "success", text: "A new code is on its way." });
              setLeft(60);
            } else setMsg({ tone: "danger", text: res.message ?? "Could not resend the code." });
          }}
          className="font-medium text-ink underline underline-offset-4 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
        >
          {left > 0 ? `resend in ${left}s` : "send a new code"}
        </button>
      </p>
      {msg && <FormAlert tone={msg.tone}>{msg.text}</FormAlert>}
    </div>
  );
}

export function VerifyEmailForm({ email: initialEmail, justSent }: { email: string; justSent: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function verify(value: string) {
    if (value.length !== 6 || loading) return;
    setLoading(true);
    setError(null);
    const res = await postJson("/api/auth/verify-email", { email, code: value });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => {
        router.replace("/account?welcome=1");
        router.refresh();
      }, 900);
      return;
    }
    setError(res.fields?.code ?? res.message ?? "Verification failed.");
    setCode("");
  }

  return (
    <AuthCard
      eyebrow="Verify email"
      title="Check your inbox"
      description={
        initialEmail ? (
          <>
            We sent a 6-digit code to <strong className="text-ink">{initialEmail}</strong>. It expires in 10 minutes.
          </>
        ) : (
          "Enter your email and the 6-digit code we sent you."
        )
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify(code);
        }}
        className="grid gap-5"
        noValidate
      >
        {!initialEmail && (
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        )}
        <OtpInput
          value={code}
          onChange={(v) => {
            setCode(v);
            setError(null);
            if (v.length === 6) verify(v);
          }}
          invalid={!!error}
          disabled={loading || done}
          autoFocus
        />
        {error && <FormAlert>{error}</FormAlert>}
        {done && (
          <FormAlert tone="success">
            <span className="flex items-center gap-2">
              <MailCheck className="h-4 w-4" /> Email verified. Taking you to your account…
            </span>
          </FormAlert>
        )}
        <Button type="submit" size="lg" loading={loading} disabled={code.length !== 6 || done} className="w-full">
          Verify email
        </Button>
      </form>
      <ResendButton email={email} purpose="verify_email" startCooldown={justSent} />
    </AuthCard>
  );
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldError(undefined);
    const res = await postJson("/api/auth/forgot-password", { email });
    setLoading(false);
    if (res.ok) {
      router.push(`/reset-password?email=${encodeURIComponent(res.email ?? email)}`);
      return;
    }
    setFieldError(res.fields?.email);
    setError(res.fields?.email ? null : (res.message ?? "Something went wrong."));
  }

  return (
    <AuthCard eyebrow="Forgot password" title="Reset your password" description="Enter your account email. If it's registered, we'll send you a 6-digit reset code.">
      <form onSubmit={submit} className="grid gap-5" noValidate>
        <Field label="Email" htmlFor="email" error={fieldError}>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!fieldError} autoFocus />
        </Field>
        {error && <FormAlert>{error}</FormAlert>}
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Send reset code
        </Button>
      </form>
      <p className="text-center text-[15px] text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-ink underline underline-offset-4">
          Back to log in
        </Link>
      </p>
    </AuthCard>
  );
}

export function ResetPasswordForm({ email: initialEmail }: { email: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    if (password !== confirm) {
      setFields({ confirm: "Passwords do not match" });
      return;
    }
    setLoading(true);
    const res = await postJson("/api/auth/reset-password", { email, code, password });
    setLoading(false);
    if (res.ok) {
      router.replace("/login?reset=1");
      return;
    }
    setFields(res.fields ?? {});
    setError(res.message ?? "Could not reset your password.");
  }

  return (
    <AuthCard
      eyebrow="New password"
      title="Choose a new password"
      description={
        initialEmail ? (
          <>
            If <strong className="text-ink">{initialEmail}</strong> has an account, we sent it a 6-digit code. Enter it below with your new
            password.
          </>
        ) : (
          "Enter your email, the code we sent and your new password."
        )
      }
    >
      <form onSubmit={submit} className="grid gap-5" noValidate>
        {!initialEmail && (
          <Field label="Email" htmlFor="email" error={fields.email}>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!fields.email} />
          </Field>
        )}
        <div className="grid gap-1.5">
          <span className="text-sm font-medium">Reset code</span>
          <OtpInput value={code} onChange={setCode} invalid={!!fields.code} autoFocus />
          {fields.code && <p className="text-[13px] text-danger">{fields.code}</p>}
        </div>
        <Field label="New password" htmlFor="password" error={fields.password}>
          <PasswordInput id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!fields.password} />
        </Field>
        <PasswordStrength value={password} />
        <Field label="Confirm new password" htmlFor="confirm" error={fields.confirm}>
          <PasswordInput id="confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} invalid={!!fields.confirm} />
        </Field>
        {error && !Object.keys(fields).length && <FormAlert>{error}</FormAlert>}
        <Button type="submit" size="lg" loading={loading} disabled={code.length !== 6} className="w-full">
          Update password
        </Button>
      </form>
      <ResendButton email={email} purpose="reset_password" startCooldown={!!initialEmail} />
    </AuthCard>
  );
}
