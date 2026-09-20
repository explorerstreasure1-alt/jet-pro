import { db, isDbConfigured } from "@/db";
import { profiles, seriesProgress, words } from "@/db/schema";
import { SERIES_SIZE, SERIES_WAVES } from "@/lib/constants";
import { cefrRank, seriesIsUnlocked } from "@/lib/game";
import { count, eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/ensure-seed";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 7500 words per language ÷ 150 = 50 series (0 remainder).
 * Series are deterministic 150-word blocks; after the last one the loop
 * restarts from series #1. Blocks at or below the learner's CEFR level are
 * unlocked immediately (a B1 learner has all A1/A2/B1 blocks open).
 */
export async function GET(req: NextRequest) {
  try {
    if (!isDbConfigured()) {
      return Response.json({ error: "no_db", mode: "local" }, { status: 503 });
    }
    const language = req.nextUrl.searchParams.get("language") ?? "en";
    await ensureSeeded(language);
    const profileId = Number(req.nextUrl.searchParams.get("profileId"));
    if (!Number.isFinite(profileId)) return Response.json({ error: "profileId" }, { status: 400 });

    const [c] = await db.select({ c: count() }).from(words).where(eq(words.language, language));
    const total = Number(c?.c ?? 0);
    const seriesCount = Math.floor(total / SERIES_SIZE);
    const remainder = total % SERIES_SIZE;

    // Ordered levels for each word, so every block gets an entry CEFR level.
    const levelRows = await db
      .select({ level: words.level })
      .from(words)
      .where(eq(words.language, language))
      .orderBy(words.id);
    const levels = levelRows.map((r) => r.level);

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .limit(1);
    const learnerRank = cefrRank(profile?.cefrLevel ?? "A1");

    const progressRows = await db
      .select()
      .from(seriesProgress)
      .where(eq(seriesProgress.profileId, profileId));
    const prefix = `s-${language}-`;
    const map = new Map<number, { completed: boolean; bestScore: number; stars: number }>();
    let completedCount = 0;
    for (const r of progressRows) {
      if (!r.seriesId.startsWith(prefix)) continue;
      const n = Number(r.seriesId.slice(prefix.length));
      if (!Number.isFinite(n)) continue;
      map.set(n, { completed: r.completed, bestScore: r.bestScore, stars: r.stars });
      if (r.completed) completedCount += 1;
    }
    const allDone = seriesCount > 0 && completedCount >= seriesCount;
    const loop = seriesCount ? Math.floor(completedCount / seriesCount) + 1 : 1;

    const list = Array.from({ length: seriesCount }, (_, i) => {
      const n = i + 1;
      const slice = levels.slice(i * SERIES_SIZE, (i + 1) * SERIES_SIZE);
      const entryRank = slice.length ? Math.min(...slice.map((l) => cefrRank(l))) : 1;
      const entryLevel = ["A1", "A2", "B1", "B2", "C1"][entryRank - 1]!;
      const p = map.get(n);
      const prev = i > 0 && Boolean(map.get(n - 1)?.completed);
      const unlocked =
        i === 0 || allDone || seriesIsUnlocked({ index: i, entryRank, learnerRank, previousCompleted: prev });
      return {
        id: `${prefix}${n}`,
        number: n,
        level: entryLevel,
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
      learnerLevel: profile?.cefrLevel ?? "A1",
      freeThroughLevel: "B1",
      list,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "series failed" }, { status: 500 });
  }
}
