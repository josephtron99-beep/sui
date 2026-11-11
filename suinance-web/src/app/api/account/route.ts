import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb, schema } from "@/db";

export const dynamic = "force-dynamic";

/** Profile and program applications for the signed-in user (used by the static HTML edition). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  const db = await getDb();
  const applications = await db
    .select({
      id: schema.validatorApplications.id,
      validatorName: schema.validatorApplications.validatorName,
      suiAddress: schema.validatorApplications.suiAddress,
      activeOnChain: schema.validatorApplications.activeOnChain,
      status: schema.validatorApplications.status,
      createdAt: schema.validatorApplications.createdAt,
    })
    .from(schema.validatorApplications)
    .where(eq(schema.validatorApplications.userId, user.id))
    .orderBy(desc(schema.validatorApplications.createdAt));
  return NextResponse.json(
    {
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
      },
      applications,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
