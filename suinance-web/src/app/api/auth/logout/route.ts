import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/http";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
