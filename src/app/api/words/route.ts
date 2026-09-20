import { db } from "@/db";
import { wordProgress, words } from "@/db/schema";
import { ensureSeeded } from "@/lib/ensure-seed";
import { buildFallbackSeries, databaseConfigured } from "@/lib/fallback";
import { and, eq, ilike, or } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
// May trigger the one-time lexicon seed — allow up to 60s on Vercel.
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    if (!databaseConfigured()) {
      return Response.json(buildFallbackSeries(req.nextUrl.searchParams.get("language") ?? "en").list.map((series) => ({
        id: series.number,
        conceptKey: `fallback-${series.number}`,
        language: req.nextUrl.searchParams.get("language") ?? "en",
        term: `demo-${series.number}`,
        translationTr: `demo-${series.number}`,
        translationEn: `demo-${series.number}`,
        phonetic: null,
        example: null,
        exampleTr: null,
        level: "A1",
        category: "daily",
        isCustom: false,
        heat: 0,
        correctCount: 0,
        wrongCount: 0,
      })));
    }
    await ensureSeeded();
    const sp = req.nextUrl.searchParams;
    const language = sp.get("language");
    const level = sp.get("level");
    const category = sp.get("category");
    const q = sp.get("q");
    const profileId = sp.get("profileId");
    const offsetParam = sp.get("offset");
    const limitParam = sp.get("limit");

    const filters = [];
    if (language) filters.push(eq(words.language, language));
    if (level && level !== "all") filters.push(eq(words.level, level));
    if (category && category !== "all") filters.push(eq(words.category, category));
    if (q) {
      const like = `%${q}%`;
      filters.push(
        or(ilike(words.term, like), ilike(words.translationTr, like), ilike(words.translationEn, like))!,
      );
    }

    // Series blocks: deterministic 150-word windows ordered by id.
    let rows;
    if (offsetParam !== null && limitParam !== null) {
      const base = db
        .select()
        .from(words)
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(words.id)
        .limit(Number(limitParam) > 0 ? Number(limitParam) : 150)
        .offset(Number(offsetParam) || 0);
      rows = await base;
    } else {
      rows = filters.length
        ? await db.select().from(words).where(and(...filters))
        : await db.select().from(words);
    }

    const pid = profileId ? Number(profileId) : NaN;
    const prog = Number.isFinite(pid)
      ? await db.select().from(wordProgress).where(eq(wordProgress.profileId, pid))
      : [];
    const map = new Map(prog.map((p) => [p.wordId, p]));

    const payload = rows.map((w) => {
      const p = map.get(w.id);
      return {
        ...w,
        heat: p?.heat ?? 0,
        correctCount: p?.correctCount ?? 0,
        wrongCount: p?.wrongCount ?? 0,
      };
    });

    return Response.json(payload);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "words failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      language?: string;
      term?: string;
      translationTr?: string;
      translationEn?: string;
      level?: string;
      category?: string;
    };
    if (!body.language || !body.term || !body.translationTr) {
      return Response.json({ error: "missing fields" }, { status: 400 });
    }
    const key = `custom-${Date.now()}`;
    const [row] = await db
      .insert(words)
      .values({
        conceptKey: key,
        language: body.language,
        term: body.term.trim(),
        translationTr: body.translationTr.trim(),
        translationEn: (body.translationEn ?? body.term).trim(),
        level: body.level ?? "A1",
        category: body.category ?? "daily",
        isCustom: true,
      })
      .returning();
    return Response.json(row);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "create failed" }, { status: 500 });
  }
}
