import { db } from "@/db";
import { profiles, seriesProgress, words } from "@/db/schema";
import { SERIES_SIZE, SERIES_WAVES } from "@/lib/constants";
import { buildFallbackSeries, databaseConfigured } from "@/lib/fallback";
import { count, eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/ensure-seed";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 7500 words per language ÷ 150 = 50 series (0 remainder).
 * Series are deterministic 150-word blocks; after the last one the loop
 * restarts from series 1 (the whole bank is cycled).
 */
export async function GET(req: NextRequest) {
  try {
    const language = req.nextUrl.searchParams.get("language") ?? "en";
    if (!databaseConfigured()) {
      return Response.json(buildFallbackSeries(language));
    }

    await ensureSeeded();
    const profileId = Number(req.nextUrl.searchParams.get("profileId"));
    if (!Number.isFinite(profileId)) return Response.json({ error: "profileId" }, { status: 400 });

    const [c] = await db.select({ c: count() }).from(words).where(eq(words.language, language));
    const total = Number(c?.c ?? 0);
    const seriesCount = Math.floor(total / SERIES_SIZE);
    const remainder = total % SERIES_SIZE;

    const rows = await db.select().from(seriesProgress).where(eq(seriesProgress.profileId, profileId));
    const prefix = `s-${language}-`;
    const map = new Map<number, { completed: boolean; bestScore: number; stars: number }>();
    let completedCount = 0;
    for (const r of rows) {
      if (!r.seriesId.startsWith(prefix)) continue;
      const n = Number(r.seriesId.slice(prefix.length));
      if (!Number.isFinite(n)) continue;
      map.set(n, { completed: r.completed, bestScore: r.bestScore, stars: r.stars });
      if (r.completed) completedCount += 1;
    }
    const allDone = seriesCount > 0 && completedCount >= seriesCount;
    const loop = seriesCount ? Math.floor(completedCount / seriesCount) + 1 : 1;

    // CEFR-based head start: a learner's level opens a proportional slice of
    // the 50 packs without grinding from zero — A1:10, A2:20, B1:30, B2:40, C1:50.
    const [prof] = await db
      .select({ cefrLevel: profiles.cefrLevel })
      .from(profiles)
      .where(eq(profiles.id, profileId));
    const levelOrder = ["A1", "A2", "B1", "B2", "C1"];
    const levelIdx = Math.max(0, levelOrder.indexOf(prof?.cefrLevel ?? "A1"));
    const levelQuota = seriesCount
      ? Math.min(seriesCount, Math.ceil(((levelIdx + 1) / levelOrder.length) * seriesCount))
      : 0;

    const list = Array.from({ length: seriesCount }, (_, i) => {
      const n = i + 1;
      const p = map.get(n);
      // Unlock rules:
      //  - the CEFR quota opens the head slice (B1 → first 30) so the player
      //    can start from ANY of those, in any order;
      //  - beyond the quota, packs open sequentially: finishing the previous
      //    one unlocks the next (B1 done → 31, 32 … up to C1 range);
      //  - a full loop keeps everything open.
      const prevCompleted = n > 1 && Boolean(map.get(n - 1)?.completed);
      const unlocked = i === 0 || allDone || i < levelQuota || prevCompleted;
      return {
        id: `${prefix}${n}`,
        number: n,
        from: i * SERIES_SIZE + 1,
        to: Math.min(total, (i + 1) * SERIES_SIZE),
        size: SERIES_SIZE,
        waves: SERIES_WAVES,
        completed: Boolean(p?.completed),
        bestScore: p?.bestScore ?? 0,
        stars: p?.stars ?? 0,
        unlocked,
      };
    });

    return Response.json({
      language,
      total,
      size: SERIES_SIZE,
      seriesCount,
      remainder,
      loop,
      cefrLevel: prof?.cefrLevel ?? "A1",
      levelQuota,
      list,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "series failed" }, { status: 500 });
  }
}
