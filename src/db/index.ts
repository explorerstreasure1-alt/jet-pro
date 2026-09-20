import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Lazy pool: never throw at import time. On Vercel the build step imports
// route modules while collecting page data; a missing DATABASE_URL must not
// crash the build — only an actual query without config should fail.
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPostgresqlDb?: NodePgDatabase;
};

function needsSsl(url: string) {
  if (/sslmode=(require|verify-full|verify-ca|no-verify)/i.test(url)) return true;
  // Cloud Postgres hosts (Neon, Supabase, Vercel Postgres, Railway, Render…)
  return /neon\.tech|supabase\.(co|com)|vercel-storage\.com|railway\.app|render\.com|aws|azure|gcp/i.test(url) &&
    !/localhost|127\.0\.0\.1/.test(url);
}

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required (set it in Vercel → Project → Settings → Environment Variables)");
  }
  return new Pool({
    connectionString: databaseUrl,
    ssl: needsSsl(databaseUrl) ? { rejectUnauthorized: false } : undefined,
    max: 5, // serverless-friendly small pool
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  });
}

export function getPool(): Pool {
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = createPool();
  }
  return globalForDb.__arenaNextJsPostgresqlPool;
}

function getDb(): NodePgDatabase {
  if (!globalForDb.__arenaNextJsPostgresqlDb) {
    globalForDb.__arenaNextJsPostgresqlDb = drizzle(getPool());
  }
  return globalForDb.__arenaNextJsPostgresqlDb;
}

// Proxy keeps the existing `import { db } from "@/db"` API while deferring
// pool creation to first real use (query time), not import time.
export const db: NodePgDatabase = new Proxy({} as NodePgDatabase, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const real = getPool();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
