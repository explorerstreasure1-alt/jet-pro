import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// On Vercel/preview without a configured database the app must keep working:
// client components fall back to the local-first data layer in src/lib/data.ts.
const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const isLocalDb = /@(localhost|127\.0\.0\.1|postgres)([:/]|$)/.test(databaseUrl);
const pool = new pg.Pool({
  connectionString: databaseUrl,
  max: 10,
  // Managed providers (Neon, Supabase, Vercel Postgres) require SSL.
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

export const db = drizzle(pool);
export { pool };
