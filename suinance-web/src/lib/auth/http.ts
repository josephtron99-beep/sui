import "server-only";
import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import type { z } from "zod";
import { toFieldErrors } from "./validation";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "./session";

export function fail(message: string, status = 400, fields?: Record<string, string>) {
  return NextResponse.json({ ok: false, message, fields }, { status });
}

export function invalid(error: z.ZodError) {
  return fail("Please check the highlighted fields.", 422, toFieldErrors(error));
}

/** Rejects cross-site form posts: the Origin header must match the host serving the API. */
export function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers and server-side calls
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

export async function readJson(req: Request): Promise<unknown> {
  if (!isSameOrigin(req)) return { __crossOrigin: true };
  try {
    return await req.json();
  } catch {
    return {};
  }
}

export async function withSession(res: NextResponse, userId: string, version: number) {
  res.cookies.set(SESSION_COOKIE, await createSessionToken(userId, version), sessionCookieOptions);
  return res;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newReferralCode() {
  return Array.from({ length: 8 }, () => ALPHABET[randomInt(0, ALPHABET.length)]).join("");
}

export const tooMany = () => fail("Too many requests. Please wait a minute and try again.", 429);
