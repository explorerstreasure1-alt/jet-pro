import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: true });
  } catch {
    // App remains healthy on local-first fallback when no DB is provisioned.
    return Response.json({ ok: true, db: false, mode: "local" });
  }
}
