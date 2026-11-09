import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { loginSchema } from "@/lib/auth/validation";
import { fail, invalid, readJson, tooMany, withSession } from "@/lib/auth/http";
import { issueOtp, resendWaitSeconds } from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/auth/email";
import { rateLimit } from "@/lib/auth/rate-limit";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
// Keeps response time similar when the email does not exist.
let dummyHash: string | null = null;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash("suinance-timing-equaliser", 12));

export async function POST(req: Request) {
  if (!(await rateLimit("login", 20, 60_000))) return tooMany();
  const parsed = loginSchema.safeParse(await readJson(req));
  if (!parsed.success) return invalid(parsed.error);
  const { email, password } = parsed.data;

  const db = await getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

  if (user?.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return fail(`Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}, or reset your password.`, 423);
  }

  const ok = await bcrypt.compare(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !ok) {
    if (user) {
      const fails = user.failedLogins + 1;
      await db
        .update(schema.users)
        .set({ failedLogins: fails >= MAX_FAILS ? 0 : fails, lockedUntil: fails >= MAX_FAILS ? new Date(Date.now() + LOCK_MS) : null })
        .where(eq(schema.users.id, user.id));
    }
    return fail("The email or password is incorrect.", 401);
  }

  if (!user.emailVerifiedAt) {
    if ((await resendWaitSeconds(user.id, "verify_email")) === 0) {
      const code = await issueOtp(user.id, "verify_email");
      await sendOtpEmail(email, user.name, code, "verify_email").catch((e) => console.error(e));
    }
    return NextResponse.json({ ok: false, needsVerification: true, email, message: "Please verify your email first. We sent you a code." }, { status: 403 });
  }

  await db.update(schema.users).set({ failedLogins: 0, lockedUntil: null }).where(eq(schema.users.id, user.id));
  return withSession(NextResponse.json({ ok: true }), user.id, user.sessionVersion);
}
