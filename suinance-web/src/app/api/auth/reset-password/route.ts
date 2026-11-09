import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { resetSchema } from "@/lib/auth/validation";
import { fail, invalid, readJson, tooMany } from "@/lib/auth/http";
import { checkOtp, otpMessages } from "@/lib/auth/otp";
import { rateLimit } from "@/lib/auth/rate-limit";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(req: Request) {
  if (!(await rateLimit("reset", 20, 60_000))) return tooMany();
  const parsed = resetSchema.safeParse(await readJson(req));
  if (!parsed.success) return invalid(parsed.error);
  const { email, code, password } = parsed.data;

  const db = await getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!user || !user.emailVerifiedAt) return fail(otpMessages.invalid, 400, { code: otpMessages.invalid });

  const result = await checkOtp(user.id, "reset_password", code);
  if (result !== "ok") return fail(otpMessages[result], 400, { code: otpMessages[result] });

  await db
    .update(schema.users)
    .set({
      passwordHash: await bcrypt.hash(password, 12),
      sessionVersion: user.sessionVersion + 1, // signs out every existing session
      failedLogins: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id));

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
