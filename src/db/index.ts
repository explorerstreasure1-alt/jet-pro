import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

/**
 * Checks whether a usable PostgreSQL database is configured.
 * In Vercel or cloud production without DATABASE_URL/POSTGRES_URL,
 * there is no local postgres running on 127.0.0.1.
 */
export function isDbConfigured(): boolean {
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) return true;
  if (process.env.VERCEL || process.env.NODE_ENV === "production") return false;
  return true;
}

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const isLocalDb = /@(localhost|127\.0\.0\.1|postgres)([:/]|$)/.test(databaseUrl);

const pool = new pg.Pool({
  connectionString: databaseUrl,
  max: 10,
  connectionTimeoutMillis: 3500,
  idleTimeoutMillis: 15000,
  // Managed cloud providers (Neon, Supabase, Vercel Postgres) require SSL.
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

export const db = drizzle(pool);
export { pool };
