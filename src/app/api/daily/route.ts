import { db } from "@/db";
import { dailyLogs, inventory, profiles } from "@/db/schema";
import { todayIso } from "@/lib/constants";
import { buildFallbackProfile, databaseConfigured } from "@/lib/fallback";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { profileId?: number };
    if (!databaseConfigured()) {
      const fallback = buildFallbackProfile(`demo-${body.profileId ?? "daily"}`);
      return Response.json({ ok: true, already: false, profile: fallback, credits: 90, freeze: 1, fallback: true });
    }
    if (!body.profileId) return Response.json({ error: "profileId" }, { status: 400 });
    const today = todayIso();
    const rows = await db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.profileId, body.profileId), eq(dailyLogs.date, today)));
    const daily = rows[0];
    if (!daily) return Response.json({ error: "no daily" }, { status: 404 });
    if (daily.claimed) return Response.json({ ok: true, already: true });
    const ready = daily.wordsCompleted >= daily.targetWords && daily.scoreEarned >= daily.targetScore;
    if (!ready) return Response.json({ error: "incomplete" }, { status: 400 });

    await db.update(dailyLogs).set({ claimed: true }).where(eq(dailyLogs.id, daily.id));
    const [p] = await db.select().from(profiles).where(eq(profiles.id, body.profileId));
    if (p) {
      await db
        .update(profiles)
        .set({ credits: p.credits + 90, updatedAt: new Date() })
        .where(eq(profiles.id, p.id));
    }
    const freeze = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.profileId, body.profileId), eq(inventory.itemCode, "freeze")));
    if (freeze[0]) {
      await db.update(inventory).set({ qty: freeze[0].qty + 1 }).where(eq(inventory.id, freeze[0].id));
    } else {
      await db.insert(inventory).values({ profileId: body.profileId, itemCode: "freeze", qty: 1 });
    }
    return Response.json({ ok: true, credits: 90, freeze: 1 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "claim failed" }, { status: 500 });
  }
}
