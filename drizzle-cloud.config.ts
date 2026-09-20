import type { Config } from "drizzle-kit";

// Cloud schema push (Neon / Supabase / Vercel Postgres):
//   DATABASE_URL="postgresql://...?sslmode=require" npx drizzle-kit push --config=drizzle-cloud.config.ts
export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
} satisfies Config;
