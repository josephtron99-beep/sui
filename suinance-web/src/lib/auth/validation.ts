import { z } from "zod";
import { isValidPhoneNumber, type CountryCode } from "libphonenumber-js/min";

export const emailSchema = z.string().trim().toLowerCase().max(254, "This email address is too long").email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Use 128 characters or fewer")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/\d/, "Add a number");

export const otpSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit code");

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(120, "Use 120 characters or fewer")
      .regex(/^[^<>{}\[\]\/=;:@#$%^*|~`"]+$/, "Use letters, spaces, hyphens and apostrophes only"),
    email: emailSchema,
    country: z.string().length(2, "Choose your country").toUpperCase(),
    phone: z.string().trim().min(4, "Enter your mobile number").max(20, "This number is too long"),
    referralCode: z
      .string()
      .trim()
      .toUpperCase()
      .max(12)
      .regex(/^[A-Z0-9]*$/, "Referral codes use letters and numbers only")
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    acceptTerms: z.literal(true, { error: "Please accept the terms to continue" }),
  })
  .superRefine((v, ctx) => {
    try {
      if (!isValidPhoneNumber(v.phone, v.country as CountryCode)) {
        ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a valid mobile number for the selected country" });
      }
    } catch {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a valid mobile number" });
    }
  });

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password") });
export const verifySchema = z.object({ email: emailSchema, code: otpSchema });
export const emailOnlySchema = z.object({ email: emailSchema });
export const resetSchema = z.object({ email: emailSchema, code: otpSchema, password: passwordSchema });

export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const plainText = /^[^<>{}\[\]`]*$/;

export const applicationSchema = z.object({
  validatorName: z.string().trim().min(2, "Enter your validator's name").max(80, "Use 80 characters or fewer").regex(plainText, "Remove special characters such as < > { }"),
  suiAddress: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^0x[0-9a-f]{64}$/, "Enter the full Sui address: 0x followed by 64 hex characters"),
  commissionPct: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number({ error: "Enter your commission" }).min(0, "Enter a number from 0 to 100").max(100, "Enter a number from 0 to 100"),
  ),
  hosting: z.string().trim().min(2, "Tell us where the validator runs").max(120, "Use 120 characters or fewer").regex(plainText, "Remove special characters such as < > { }"),
  website: z
    .string()
    .trim()
    .max(200, "Use 200 characters or fewer")
    .refine((v) => v === "" || /^https:\/\/[^\s<>"]+\.[^\s<>"]+$/.test(v), "Enter a full link starting with https://")
    .optional(),
  contact: z.string().trim().max(120, "Use 120 characters or fewer").regex(plainText, "Remove special characters such as < > { }").optional(),
  notes: z.string().trim().max(1000, "Use 1,000 characters or fewer").optional(),
  confirm: z.literal(true, { error: "Please confirm you operate this validator" }),
});
