import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    { user: user ? { name: user.name } : null },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
