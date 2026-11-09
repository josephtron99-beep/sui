import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { parsePhoneNumberWithError, type CountryCode } from "libphonenumber-js/min";
import { getDb, schema } from "@/db";
import { registerSchema } from "@/lib/auth/validation";
import { fail, invalid, newReferralCode, readJson, tooMany } from "@/lib/auth/http";
import { issueOtp, resendWaitSeconds } from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/auth/email";
import { rateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: Request) {
  if (!(await rateLimit("register", 10, 60_000))) return tooMany();

  const parsed = registerSchema.safeParse(await readJson(req));
  if (!parsed.success) return invalid(parsed.error);
  const { name, email, country, phone, referralCode, password } = parsed.data;

  const db = await getDb();
  const e164 = parsePhoneNumberWithError(phone, country as CountryCode).number;

  let referredById: string | null = null;
  if (referralCode) {
    const [ref] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.referralCode, referralCode)).limit(1);
    if (!ref) return fail("Please check the highlighted fields.", 422, { referralCode: "This referral code does not exist." });
    referredById = ref.id;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [existing] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

  let user = existing;
  if (existing?.emailVerifiedAt) {
    return fail("Please check the highlighted fields.", 409, { email: "An account with this email already exists. Log in instead." });
  }
  if (existing) {
    if (referredById === existing.id) referredById = null;
    [user] = await db
      .update(schema.users)
      .set({ name, phone: e164, country, passwordHash, referredById, updatedAt: new Date() })
      .where(eq(schema.users.id, existing.id))
      .returning();
  } else {
    for (let attempt = 0; attempt < 5 && !user; attempt++) {
      try {
        [user] = await db
          .insert(schema.users)
          .values({ name, email, phone: e164, country, passwordHash, referralCode: newReferralCode(), referredById })
          .returning();
      } catch (err) {
        if (attempt === 4) throw err;
      }
    }
  }

  const wait = await resendWaitSeconds(user.id, "verify_email");
  if (wait === 0) {
    const code = await issueOtp(user.id, "verify_email");
    try {
      await sendOtpEmail(email, name, code, "verify_email");
    } catch (err) {
      console.error(err);
      return fail("We could not send the verification email. Please try again shortly.", 502);
    }
  }

  return NextResponse.json({ ok: true, email });
}
