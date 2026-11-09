"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Copy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

function CopyRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="grid gap-1.5">
      <span className="text-[13px] text-ink/70">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border-[1.5px] border-ink bg-paper p-1.5 pl-4">
        <span className={`min-w-0 flex-1 truncate ${mono ? "font-mono text-xl font-medium tracking-[0.2em]" : "text-sm"}`}>{value}</span>
        <Button
          type="button"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

export function AccountActions({ code, link }: { code: string; link: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <div className="grid gap-4">
      <CopyRow label="Code" value={code} mono />
      <CopyRow label="Link" value={link} />
      <Button
        variant="outline"
        className="mt-2 w-fit"
        loading={loading}
        onClick={async () => {
          setLoading(true);
          await fetch("/api/auth/logout", { method: "POST" });
          router.replace("/");
          router.refresh();
        }}
      >
        <LogOut className="h-4 w-4" aria-hidden /> Log out
      </Button>
    </div>
  );
}
