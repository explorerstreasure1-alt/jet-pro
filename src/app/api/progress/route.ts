import { db } from "@/db";
import { achievements, profiles, wordProgress } from "@/db/schema";
import { databaseConfigured } from "@/lib/fallback";
import { eq, and } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      profileId?: number;
      results?: { wordId: number; correct: boolean }[];
      reset?: boolean;
    };
    if (!databaseConfigured()) {
      return Response.json({ ok: true, mastered: 0, fallback: true });
    }
    if (!body.profileId) return Response.json({ error: "profileId required" }, { status: 400 });

    if (body.reset) {
      await db.delete(wordProgress).where(eq(wordProgress.profileId, body.profileId));
      return Response.json({ ok: true });
    }

    const results = body.results ?? [];
    for (const r of results) {
      const existing = await db
        .select()
        .from(wordProgress)
        .where(and(eq(wordProgress.profileId, body.profileId), eq(wordProgress.wordId, r.wordId)));
      const cur = existing[0];
      const heatDelta = r.correct ? 18 : -12;
      if (!cur) {
        await db.insert(wordProgress).values({
          profileId: body.profileId,
          wordId: r.wordId,
          heat: Math.max(0, Math.min(100, heatDelta)),
          correctCount: r.correct ? 1 : 0,
          wrongCount: r.correct ? 0 : 1,
          lastSeenAt: new Date(),
        });
      } else {
        await db
          .update(wordProgress)
          .set({
            heat: Math.max(0, Math.min(100, cur.heat + heatDelta)),
            correctCount: cur.correctCount + (r.correct ? 1 : 0),
            wrongCount: cur.wrongCount + (r.correct ? 0 : 1),
            lastSeenAt: new Date(),
          })
          .where(eq(wordProgress.id, cur.id));
      }
    }

    const all = await db.select().from(wordProgress).where(eq(wordProgress.profileId, body.profileId));
    const mastered = all.filter((p) => p.heat >= 70).length;
    await db
      .update(profiles)
      .set({ wordsLearned: mastered, updatedAt: new Date() })
      .where(eq(profiles.id, body.profileId));
    if (mastered >= 25) {
      await db
        .insert(achievements)
        .values({ profileId: body.profileId, code: "lexicon_25" })
        .onConflictDoNothing();
    }

    return Response.json({ ok: true, mastered });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "progress failed" }, { status: 500 });
  }
}
