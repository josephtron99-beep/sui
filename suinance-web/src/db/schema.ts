import { boolean, integer, pgTable, text, timestamp, uuid, varchar, index, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    country: varchar("country", { length: 2 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    referralCode: varchar("referral_code", { length: 12 }).notNull(),
    referredById: uuid("referred_by_id"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    sessionVersion: integer("session_version").notNull().default(0),
    failedLogins: integer("failed_logins").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email), uniqueIndex("users_referral_code_idx").on(t.referralCode)],
);

export const otpCodes = pgTable(
  "otp_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    purpose: varchar("purpose", { length: 20 }).notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("otp_user_purpose_idx").on(t.userId, t.purpose)],
);

export const validatorApplications = pgTable(
  "validator_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    validatorName: varchar("validator_name", { length: 80 }).notNull(),
    suiAddress: varchar("sui_address", { length: 66 }).notNull(),
    commissionPct: varchar("commission_pct", { length: 8 }).notNull(),
    hosting: varchar("hosting", { length: 120 }).notNull(),
    website: varchar("website", { length: 200 }),
    contact: varchar("contact", { length: 120 }),
    notes: text("notes"),
    activeOnChain: boolean("active_on_chain").notNull().default(false),
    status: varchar("status", { length: 20 }).notNull().default("in_review"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("applications_address_idx").on(t.suiAddress), index("applications_user_idx").on(t.userId)],
);

export type User = typeof users.$inferSelect;
export type ValidatorApplication = typeof validatorApplications.$inferSelect;
export type OtpPurpose = "verify_email" | "reset_password";

/** Creates any missing tables on first connection (Postgres and local PGlite), so no migration step is needed. */
export const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  email varchar(254) NOT NULL,
  phone varchar(20) NOT NULL,
  country varchar(2) NOT NULL,
  password_hash text NOT NULL,
  referral_code varchar(12) NOT NULL,
  referred_by_id uuid,
  email_verified_at timestamptz,
  session_version integer NOT NULL DEFAULT 0,
  failed_logins integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_idx ON users (referral_code);
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose varchar(20) NOT NULL,
  code_hash text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS otp_user_purpose_idx ON otp_codes (user_id, purpose);
CREATE TABLE IF NOT EXISTS validator_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  validator_name varchar(80) NOT NULL,
  sui_address varchar(66) NOT NULL,
  commission_pct varchar(8) NOT NULL,
  hosting varchar(120) NOT NULL,
  website varchar(200),
  contact varchar(120),
  notes text,
  active_on_chain boolean NOT NULL DEFAULT false,
  status varchar(20) NOT NULL DEFAULT 'in_review',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS applications_address_idx ON validator_applications (sui_address);
CREATE INDEX IF NOT EXISTS applications_user_idx ON validator_applications (user_id);
`;
