import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { emailSchema } from "@/lib/auth/validation";
import { fail, invalid, readJson, tooMany } from "@/lib/auth/http";
import { issueOtp, resendWaitSeconds } from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/auth/email";
import { rateLimit } from "@/lib/auth/rate-limit";

const bodySchema = z.object({ email: emailSchema, purpose: z.enum(["verify_email", "reset_password"]) });

export async function POST(req: Request) {
  if (!(await rateLimit("resend", 10, 60_000))) return tooMany();
  const parsed = bodySchema.safeParse(await readJson(req));
  if (!parsed.success) return invalid(parsed.error);
  const { email, purpose } = parsed.data;

  const db = await getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

  // Same response whether or not the account exists, so emails can't be discovered.
  const eligible = user && (purpose === "verify_email" ? !user.emailVerifiedAt : !!user.emailVerifiedAt);
  if (eligible) {
    const wait = await resendWaitSeconds(user.id, purpose);
    if (wait > 0)
      return fail(wait > 90 ? `Too many codes requested. Try again in ${Math.ceil(wait / 60)} minutes.` : `Please wait ${wait} seconds before requesting another code.`, 429);
    const code = await issueOtp(user.id, purpose);
    try {
      await sendOtpEmail(email, user.name, code, purpose);
    } catch (err) {
      console.error(err);
      return fail("We could not send the email. Please try again shortly.", 502);
    }
  }
  return NextResponse.json({ ok: true });
}
