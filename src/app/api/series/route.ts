import { db } from "@/db";
import { seriesProgress, words } from "@/db/schema";
import { SERIES_SIZE, SERIES_WAVES } from "@/lib/constants";
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
    await ensureSeeded();
    const profileId = Number(req.nextUrl.searchParams.get("profileId"));
    const language = req.nextUrl.searchParams.get("language") ?? "en";
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

    const list = Array.from({ length: seriesCount }, (_, i) => {
      const n = i + 1;
      const p = map.get(n);
      const unlocked = i === 0 || allDone || i < completedCount;
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

    return Response.json({ language, total, size: SERIES_SIZE, seriesCount, remainder, loop, list });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "series failed" }, { status: 500 });
  }
}
