import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { emailOnlySchema } from "@/lib/auth/validation";
import { invalid, readJson, tooMany } from "@/lib/auth/http";
import { issueOtp, resendWaitSeconds } from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/auth/email";
import { rateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: Request) {
  if (!(await rateLimit("forgot", 8, 60_000))) return tooMany();
  const parsed = emailOnlySchema.safeParse(await readJson(req));
  if (!parsed.success) return invalid(parsed.error);
  const { email } = parsed.data;

  const db = await getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

  if (user?.emailVerifiedAt && (await resendWaitSeconds(user.id, "reset_password")) === 0) {
    const code = await issueOtp(user.id, "reset_password");
    await sendOtpEmail(email, user.name, code, "reset_password").catch((e) => console.error(e));
  }
  // Always the same answer, so this endpoint can't be used to find accounts.
  return NextResponse.json({ ok: true, email });
}
