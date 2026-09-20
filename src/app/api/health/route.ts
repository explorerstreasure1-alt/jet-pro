import { db } from "@/db";
import { databaseConfigured } from "@/lib/fallback";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!databaseConfigured()) {
      return Response.json({ ok: false, fallback: true, message: "DATABASE_URL not configured" });
    }
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, fallback: false });
  } catch {
    return Response.json({ ok: false, fallback: true }, { status: 500 });
  }
}
