import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { applicationSchema } from "@/lib/auth/validation";
import { fail, invalid, readJson, tooMany } from "@/lib/auth/http";
import { getCurrentUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/auth/rate-limit";
import { safeNetworkSnapshot } from "@/lib/sui/network";

export async function POST(req: Request) {
  if (!(await rateLimit("apply", 5, 60_000))) return tooMany();

  const user = await getCurrentUser();
  if (!user) return fail("Please log in to apply.", 401);

  const parsed = applicationSchema.safeParse(await readJson(req));
  if (!parsed.success) return invalid(parsed.error);
  const { validatorName, suiAddress, commissionPct, hosting, website, contact, notes } = parsed.data;

  const db = await getDb();
  const [taken] = await db
    .select({ id: schema.validatorApplications.id })
    .from(schema.validatorApplications)
    .where(eq(schema.validatorApplications.suiAddress, suiAddress))
    .limit(1);
  if (taken) return fail("Please check the highlighted fields.", 409, { suiAddress: "An application for this validator address already exists." });

  const [{ n }] = await db
    .select({ n: count() })
    .from(schema.validatorApplications)
    .where(eq(schema.validatorApplications.userId, user.id));
  if (n >= 5) return fail("This account already has 5 applications. Contact us to add more validators.", 429);

  const snap = await safeNetworkSnapshot();
  const activeOnChain = Boolean(snap?.validators.some((v) => v.address.toLowerCase() === suiAddress));

  try {
    await db.insert(schema.validatorApplications).values({
      userId: user.id,
      validatorName,
      suiAddress,
      commissionPct: String(commissionPct),
      hosting,
      website: website || null,
      contact: contact || null,
      notes: notes || null,
      activeOnChain,
    });
  } catch {
    return fail("Please check the highlighted fields.", 409, { suiAddress: "An application for this validator address already exists." });
  }

  return NextResponse.json({ ok: true, activeOnChain });
}
