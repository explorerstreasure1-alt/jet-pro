import { db } from "@/db";
import {
  achievements,
  dailyLogs,
  gameSessions,
  profiles,
  seriesProgress,
} from "@/db/schema";
import { todayIso } from "@/lib/constants";
import { databaseConfigured } from "@/lib/fallback";
import { xpToRank } from "@/lib/game";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!databaseConfigured()) {
    return Response.json([]);
  }
  const profileId = Number(req.nextUrl.searchParams.get("profileId"));
  if (!Number.isFinite(profileId)) return Response.json({ error: "profileId" }, { status: 400 });
  const rows = await db.select().from(gameSessions).where(eq(gameSessions.profileId, profileId));
  const recent = rows.sort((a, b) => b.id - a.id).slice(0, 20);
  return Response.json(recent);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      profileId?: number;
      language?: string;
      level?: string;
      category?: string;
      mode?: string;
      seriesId?: string | null;
      score?: number;
      wavesCompleted?: number;
      maxCombo?: number;
      wordsCorrect?: number;
      wordsWrong?: number;
      livesLeft?: number;
      durationMs?: number;
      won?: boolean;
    };
    if (!databaseConfigured()) {
      return Response.json({ ok: true, fallback: true, unlocked: [] });
    }
    if (!body.profileId || !body.language || !body.level) {
      return Response.json({ error: "missing" }, { status: 400 });
    }

    const score = body.score ?? 0;
    const wordsCorrect = body.wordsCorrect ?? 0;
    const wordsWrong = body.wordsWrong ?? 0;
    const maxCombo = body.maxCombo ?? 0;
    const won = Boolean(body.won);

    const [session] = await db
      .insert(gameSessions)
      .values({
        profileId: body.profileId,
        language: body.language,
        level: body.level,
        category: body.category ?? "all",
        mode: body.mode ?? "arcade",
        seriesId: body.seriesId ?? null,
        score,
        wavesCompleted: body.wavesCompleted ?? 0,
        maxCombo,
        wordsCorrect,
        wordsWrong,
        livesLeft: body.livesLeft ?? 0,
        durationMs: body.durationMs ?? 0,
      })
      .returning();

    const [p] = await db.select().from(profiles).where(eq(profiles.id, body.profileId));
    if (!p) return Response.json({ session, unlocked: [] });

    const xpGain = wordsCorrect * 12 + (won ? 80 : 20) + Math.floor(score / 50);
    const creditGain = 12 + wordsCorrect * 2 + (won ? 25 : 0) + (maxCombo >= 8 ? 15 : 0);
    const high = Math.max(p.highScore, score);
    const xp = p.xp + xpGain;
    const [updated] = await db
      .update(profiles)
      .set({
        credits: p.credits + creditGain,
        highScore: high,
        totalScore: p.totalScore + score,
        gamesPlayed: p.gamesPlayed + 1,
        xp,
        rankLevel: xpToRank(xp),
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, p.id))
      .returning();

    const today = todayIso();
    const dailies = await db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.profileId, p.id), eq(dailyLogs.date, today)));
    const daily = dailies[0];
    if (daily) {
      await db
        .update(dailyLogs)
        .set({
          wordsCompleted: daily.wordsCompleted + wordsCorrect,
          scoreEarned: daily.scoreEarned + score,
        })
        .where(eq(dailyLogs.id, daily.id));
    } else {
      await db.insert(dailyLogs).values({
        profileId: p.id,
        date: today,
        wordsCompleted: wordsCorrect,
        scoreEarned: score,
      });
    }

    if (body.seriesId && won) {
      const stars = (body.livesLeft ?? 0) >= 70 ? 3 : (body.livesLeft ?? 0) >= 40 ? 2 : 1;
      const existing = await db
        .select()
        .from(seriesProgress)
        .where(and(eq(seriesProgress.profileId, p.id), eq(seriesProgress.seriesId, body.seriesId)));
      const cur = existing[0];
      if (!cur) {
        await db.insert(seriesProgress).values({
          profileId: p.id,
          seriesId: body.seriesId,
          completed: true,
          bestScore: score,
          stars,
        });
      } else {
        await db
          .update(seriesProgress)
          .set({
            completed: true,
            bestScore: Math.max(cur.bestScore, score),
            stars: Math.max(cur.stars, stars),
          })
          .where(eq(seriesProgress.id, cur.id));
      }
    }

    const unlocked: string[] = [];
    const want: string[] = [];
    if (wordsCorrect > 0) want.push("first_blood");
    if (maxCombo >= 5) want.push("combo_5");
    if (maxCombo >= 10) want.push("combo_10");
    if (won && wordsWrong === 0) want.push("perfect_wave");
    const total = wordsCorrect + wordsWrong;
    if (won && total > 0 && wordsCorrect / total >= 0.9) want.push("sharpshooter");
    if (won && (body.livesLeft ?? 0) >= 50) want.push("survivor");
    if (won && body.level === "C1") want.push("c1_clear");

    const langs = await db.select().from(gameSessions).where(eq(gameSessions.profileId, p.id));
    const uniqueLangs = new Set(langs.map((s) => s.language));
    if (uniqueLangs.size >= 3) want.push("polyglot");

    for (const code of want) {
      const res = await db
        .insert(achievements)
        .values({ profileId: p.id, code })
        .onConflictDoNothing()
        .returning();
      if (res[0]) unlocked.push(code);
    }

    return Response.json({
      session,
      profile: updated,
      xpGain,
      creditGain,
      newRecord: score > p.highScore,
      unlocked,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "session failed" }, { status: 500 });
  }
}
