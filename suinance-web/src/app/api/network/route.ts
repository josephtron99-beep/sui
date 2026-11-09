import { NextResponse } from "next/server";
import { safeNetworkSnapshot } from "@/lib/sui/network";

export const revalidate = 300;

export async function GET() {
  const snap = await safeNetworkSnapshot();
  if (!snap) return NextResponse.json({ error: "Network data is temporarily unavailable." }, { status: 503 });
  return NextResponse.json(snap);
}
