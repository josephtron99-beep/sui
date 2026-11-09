import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { and, asc, desc, eq, gte, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { OtpPurpose } from "@/db/schema";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const OTP_MAX_PER_HOUR = 5;

function hash(code: string, userId: string) {
  const pepper = process.env.SESSION_SECRET ?? "dev-pepper";
  return createHash("sha256").update(`${userId}:${code}:${pepper}`).digest("hex");
}

/** Returns seconds to wait if a code was sent too recently, otherwise 0. */
export async function resendWaitSeconds(userId: string, purpose: OtpPurpose) {
  const db = await getDb();
  const [last] = await db
    .select({ createdAt: schema.otpCodes.createdAt })
    .from(schema.otpCodes)
    .where(and(eq(schema.otpCodes.userId, userId), eq(schema.otpCodes.purpose, purpose)))
    .orderBy(desc(schema.otpCodes.createdAt))
    .limit(1);
  if (!last) return 0;
  const left = OTP_RESEND_COOLDOWN_MS - (Date.now() - new Date(last.createdAt).getTime());
  if (left > 0) return Math.ceil(left / 1000);

  // Hourly cap: limits how many fresh codes (and so guesses) anyone can get.
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await db
    .select({ createdAt: schema.otpCodes.createdAt })
    .from(schema.otpCodes)
    .where(and(eq(schema.otpCodes.userId, userId), eq(schema.otpCodes.purpose, purpose), gte(schema.otpCodes.createdAt, hourAgo)))
    .orderBy(asc(schema.otpCodes.createdAt));
  if (recent.length >= OTP_MAX_PER_HOUR) {
    return Math.ceil((new Date(recent[0].createdAt).getTime() + 60 * 60 * 1000 - Date.now()) / 1000);
  }
  return 0;
}

/** Creates a fresh code, invalidating earlier unused codes for the same purpose. */
export async function issueOtp(userId: string, purpose: OtpPurpose) {
  const db = await getDb();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db
    .update(schema.otpCodes)
    .set({ consumedAt: new Date() })
    .where(and(eq(schema.otpCodes.userId, userId), eq(schema.otpCodes.purpose, purpose), isNull(schema.otpCodes.consumedAt)));
  await db.insert(schema.otpCodes).values({ userId, purpose, codeHash: hash(code, userId), expiresAt: new Date(Date.now() + OTP_TTL_MS) });
  return code;
}

export type OtpResult = "ok" | "invalid" | "expired" | "too_many";

export async function checkOtp(userId: string, purpose: OtpPurpose, code: string): Promise<OtpResult> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(schema.otpCodes)
    .where(and(eq(schema.otpCodes.userId, userId), eq(schema.otpCodes.purpose, purpose), isNull(schema.otpCodes.consumedAt)))
    .orderBy(desc(schema.otpCodes.createdAt))
    .limit(1);
  if (!row) return "expired";
  if (row.expiresAt.getTime() < Date.now()) return "expired";
  if (row.attempts >= OTP_MAX_ATTEMPTS) return "too_many";

  const a = Buffer.from(row.codeHash, "hex");
  const b = Buffer.from(hash(code, userId), "hex");
  const match = a.length === b.length && timingSafeEqual(a, b);
  if (!match) {
    await db.update(schema.otpCodes).set({ attempts: row.attempts + 1 }).where(eq(schema.otpCodes.id, row.id));
    return row.attempts + 1 >= OTP_MAX_ATTEMPTS ? "too_many" : "invalid";
  }
  await db.update(schema.otpCodes).set({ consumedAt: new Date() }).where(eq(schema.otpCodes.id, row.id));
  return "ok";
}

export const otpMessages: Record<Exclude<OtpResult, "ok">, string> = {
  invalid: "That code is not right. Check the email and try again.",
  expired: "This code has expired. Request a new one.",
  too_many: "Too many wrong attempts. Request a new code.",
};
