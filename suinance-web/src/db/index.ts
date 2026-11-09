import "server-only";
import { drizzle as drizzlePg, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DB = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __suinanceDb?: Promise<DB> };

async function create(): Promise<DB> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const client = postgres(url, { prepare: false, max: 5 });
    return drizzlePg(client, { schema });
  }
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is not set. Add a Postgres database before deploying.");
  }
  // Local development fallback: an embedded Postgres (PGlite) stored in .pglite/
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle: drizzleLite } = await import("drizzle-orm/pglite");
  const lite = new PGlite("./.pglite");
  await lite.exec(schema.BOOTSTRAP_SQL);
  return drizzleLite(lite, { schema }) as unknown as DB;
}

export function getDb(): Promise<DB> {
  globalForDb.__suinanceDb ??= create();
  return globalForDb.__suinanceDb;
}

export { schema };
