"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export type ApiResult = { ok: boolean; message?: string; fields?: Record<string, string>; needsVerification?: boolean; email?: string };

export async function postJson(url: string, body: unknown): Promise<ApiResult & { status: number }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as ApiResult;
    return { ...data, ok: res.ok && data.ok !== false, status: res.status };
  } catch {
    return { ok: false, status: 0, message: "Network error. Check your connection and try again." };
  }
}

export function AuthCard({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="grid gap-7">
      <div className="grid gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{eyebrow}</span>
        <h1 className="text-[clamp(28px,4vw,38px)] font-extrabold">{title}</h1>
        {description && <p className="text-[15px] text-muted">{description}</p>}
      </div>
      {children}
    </motion.div>
  );
}
