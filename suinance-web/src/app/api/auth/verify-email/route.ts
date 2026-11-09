import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { verifySchema } from "@/lib/auth/validation";
import { fail, invalid, readJson, tooMany, withSession } from "@/lib/auth/http";
import { checkOtp, otpMessages } from "@/lib/auth/otp";
import { rateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: Request) {
  if (!(await rateLimit("verify", 20, 60_000))) return tooMany();
  const parsed = verifySchema.safeParse(await readJson(req));
  if (!parsed.success) return invalid(parsed.error);
  const { email, code } = parsed.data;

  const db = await getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!user) return fail(otpMessages.invalid, 400, { code: otpMessages.invalid });
  if (user.emailVerifiedAt) return fail("This email is already verified. Please log in.", 409);

  const result = await checkOtp(user.id, "verify_email", code);
  if (result !== "ok") return fail(otpMessages[result], 400, { code: otpMessages[result] });

  const [updated] = await db
    .update(schema.users)
    .set({ emailVerifiedAt: new Date(), failedLogins: 0, lockedUntil: null, updatedAt: new Date() })
    .where(eq(schema.users.id, user.id))
    .returning();

  return withSession(NextResponse.json({ ok: true }), updated.id, updated.sessionVersion);
}
