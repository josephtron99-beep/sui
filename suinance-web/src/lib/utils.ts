import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MIST_PER_SUI = 1_000_000_000n;

/** Convert a MIST amount (bigint or numeric string) to a SUI number for display only. */
export function mistToSui(mist: bigint | string | number): number {
  const v = typeof mist === "bigint" ? mist : BigInt(String(mist).split(".")[0] || "0");
  const whole = v / MIST_PER_SUI;
  const frac = v % MIST_PER_SUI;
  return Number(whole) + Number(frac) / 1e9;
}

/** Convert a user-typed SUI string to MIST without floating point error. */
export function suiToMist(input: string): bigint {
  const clean = input.trim();
  if (!/^\d+(\.\d{0,9})?$/.test(clean)) throw new Error("Enter a valid amount");
  const [w, f = ""] = clean.split(".");
  return BigInt(w) * MIST_PER_SUI + BigInt((f + "000000000").slice(0, 9));
}

export function formatNumber(n: number, digits = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatCompact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
}

export function shortAddress(addr: string, size = 6) {
  if (!addr) return "";
  return `${addr.slice(0, size)}…${addr.slice(-4)}`;
}
