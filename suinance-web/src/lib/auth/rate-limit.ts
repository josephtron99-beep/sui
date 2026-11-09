import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort fixed-window limiter, kept in memory per server instance.
 * It slows down scripted abuse; per-account limits in the database
 * (OTP attempts, login lockout, resend cooldown) are the real protection.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export async function rateLimit(scope: string, limit: number, windowMs: number) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count += 1;
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  return b.count <= limit;
}
