import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

export const SESSION_COOKIE = "suinance_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set to at least 32 characters.");
    return new TextEncoder().encode("dev-only-insecure-secret-change-me-0123456789");
  }
  return new TextEncoder().encode(s);
}

export async function createSessionToken(userId: string, version: number) {
  return new SignJWT({ v: version })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  referralCode: string;
  createdAt: Date;
};

/** Reads and validates the session cookie. Returns null when signed out or the session was revoked. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    const db = await getDb();
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, payload.sub)).limit(1);
    if (!u || !u.emailVerifiedAt || u.sessionVersion !== payload.v) return null;
    return { id: u.id, name: u.name, email: u.email, phone: u.phone, country: u.country, referralCode: u.referralCode, createdAt: u.createdAt };
  } catch {
    return null;
  }
}
