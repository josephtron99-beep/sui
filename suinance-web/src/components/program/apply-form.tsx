"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form";
import { postJson } from "@/components/auth/shared";

const empty = { validatorName: "", suiAddress: "", commissionPct: "", hosting: "", website: "", contact: "", notes: "", confirm: false };

export function ApplyForm({ maxCommissionPct }: { maxCommissionPct: number }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | { activeOnChain: boolean }>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (fields[k]) setFields((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== k)));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    setLoading(true);
    const res = await postJson("/api/program/apply", form);
    setLoading(false);
    if (res.ok) {
      setDone({ activeOnChain: Boolean((res as { activeOnChain?: boolean }).activeOnChain) });
      setForm(empty);
      router.refresh();
      return;
    }
    setFields(res.fields ?? {});
    setError(res.message ?? "Could not send your application.");
  }

  if (done) {
    return (
      <div className="grid gap-4 rounded-card border-[1.5px] border-ink bg-paper p-6 sm:p-8" role="status">
        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
        <h3 className="text-2xl font-bold">Application received</h3>
        <p className="text-muted">
          {done.activeOnChain
            ? "We found your validator in the active set on Sui mainnet. The on-chain review has started, and we will email you when it is done."
            : "This address is not in Sui's active validator set yet. We have saved your application and will review it once the validator is active."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/account" className="font-medium underline underline-offset-4">
            See it in your account
          </Link>
          <button type="button" onClick={() => setDone(null)} className="font-medium text-muted underline underline-offset-4">
            Apply with another validator
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-card border-[1.5px] border-ink bg-paper p-6 sm:p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Validator name" htmlFor="validatorName" error={fields.validatorName}>
          <Input id="validatorName" value={form.validatorName} onChange={(e) => set("validatorName", e.target.value)} invalid={!!fields.validatorName} required />
        </Field>
        <Field label="Commission (%)" htmlFor="commissionPct" error={fields.commissionPct} hint={`Program cap: ${maxCommissionPct}%`}>
          <Input
            id="commissionPct"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            value={form.commissionPct}
            onChange={(e) => set("commissionPct", e.target.value)}
            invalid={!!fields.commissionPct}
            required
          />
        </Field>
      </div>
      <Field label="Validator Sui address" htmlFor="suiAddress" error={fields.suiAddress} hint="The sui_address in your validator's on-chain metadata.">
        <Input
          id="suiAddress"
          autoComplete="off"
          spellCheck={false}
          placeholder="0x…"
          value={form.suiAddress}
          onChange={(e) => set("suiAddress", e.target.value.trim())}
          invalid={!!fields.suiAddress}
          className="font-mono text-[13px]"
          required
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Hosting provider and region" htmlFor="hosting" error={fields.hosting}>
          <Input id="hosting" placeholder="e.g. own hardware, Frankfurt" value={form.hosting} onChange={(e) => set("hosting", e.target.value)} invalid={!!fields.hosting} required />
        </Field>
        <Field label="Website" htmlFor="website" error={fields.website} optional>
          <Input id="website" type="url" inputMode="url" placeholder="https://" value={form.website} onChange={(e) => set("website", e.target.value)} invalid={!!fields.website} />
        </Field>
      </div>
      <Field label="Operations contact" htmlFor="contact" error={fields.contact} hint="Telegram, Discord or a team email." optional>
        <Input id="contact" value={form.contact} onChange={(e) => set("contact", e.target.value)} invalid={!!fields.contact} />
      </Field>
      <Field label="Anything else we should know" htmlFor="notes" error={fields.notes} optional>
        <textarea
          id="notes"
          rows={4}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          maxLength={1000}
          className="w-full rounded-xl border-[1.5px] border-line bg-paper px-4 py-3 text-[15px] text-ink outline-none transition-[border-color,box-shadow] hover:border-ink/40 focus:border-ink focus:shadow-[0_0_0_4px_var(--yellow-soft)]"
        />
      </Field>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={form.confirm}
          onChange={(e) => set("confirm", e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-ink"
          aria-invalid={!!fields.confirm || undefined}
        />
        <span className="text-muted">I operate this validator, and I agree to the program standards and the Terms of use.</span>
      </label>
      {fields.confirm && <p className="-mt-3 text-[13px] text-danger">{fields.confirm}</p>}
      {error && <FormAlert>{error}</FormAlert>}
      <Button type="submit" size="lg" loading={loading} className="w-full sm:w-fit">
        Submit application
      </Button>
    </form>
  );
}
