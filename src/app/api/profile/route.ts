import { db, isDbConfigured } from "@/db";
import { achievements, dailyLogs, inventory, profiles } from "@/db/schema";
import { randomCallsign, todayIso } from "@/lib/constants";
import { ensureSeeded } from "@/lib/ensure-seed";
import { xpToRank } from "@/lib/game";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function applyStreak(last: string | null, current: number, today: string) {
  if (!last) return { streak: 1, lastPlayedDate: today };
  if (last === today) return { streak: current, lastPlayedDate: last };
  const prev = new Date(`${today}T00:00:00.000Z`);
  prev.setUTCDate(prev.getUTCDate() - 1);
  const y = prev.toISOString().slice(0, 10);
  if (last === y) return { streak: current + 1, lastPlayedDate: today };
  return { streak: 1, lastPlayedDate: today };
}

export async function GET(req: NextRequest) {
  try {
    if (!isDbConfigured()) {
      return Response.json({ error: "no_db", mode: "local" }, { status: 503 });
    }
    await ensureSeeded();
    const clientId = req.nextUrl.searchParams.get("clientId");
    if (!clientId) return Response.json({ error: "clientId required" }, { status: 400 });

    let [p] = await db.select().from(profiles).where(eq(profiles.clientId, clientId));
    if (!p) {
      const inserted = await db
        .insert(profiles)
        .values({ clientId, callsign: randomCallsign() })
        .returning();
      p = inserted[0]!;
      await db.insert(inventory).values([
        { profileId: p.id, itemCode: "freeze", qty: 2 },
        { profileId: p.id, itemCode: "hint", qty: 3 },
        { profileId: p.id, itemCode: "shield", qty: 1 },
      ]);
    }

    const today = todayIso();
    const next = applyStreak(p.lastPlayedDate, p.streak, today);
    if (next.lastPlayedDate !== p.lastPlayedDate || next.streak !== p.streak) {
      const updated = await db
        .update(profiles)
        .set({ streak: next.streak, lastPlayedDate: next.lastPlayedDate, updatedAt: new Date() })
        .where(eq(profiles.id, p.id))
        .returning();
      p = updated[0] ?? p;
      if (next.streak >= 3) {
        await db.insert(achievements).values({ profileId: p.id, code: "streak_3" }).onConflictDoNothing();
      }
      if (next.streak >= 7) {
        await db.insert(achievements).values({ profileId: p.id, code: "streak_7" }).onConflictDoNothing();
      }
    }

    const inv = await db.select().from(inventory).where(eq(inventory.profileId, p.id));
    const ach = await db.select().from(achievements).where(eq(achievements.profileId, p.id));
    const existingDaily = await db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.profileId, p.id), eq(dailyLogs.date, today)));

    let daily = existingDaily[0];
    if (!daily) {
      const created = await db
        .insert(dailyLogs)
        .values({ profileId: p.id, date: today })
        .onConflictDoNothing()
        .returning();
      daily = created[0];
      if (!daily) {
        const again = await db
          .select()
          .from(dailyLogs)
          .where(and(eq(dailyLogs.profileId, p.id), eq(dailyLogs.date, today)));
        daily = again[0];
      }
    }

    const defaultSettings = {
      uiLang: "tr",
      fontScale: 1,
      highContrast: false,
      eyeProtect: false,
      reducedMotion: false,
      dyslexiaFont: false,
      sfx: true,
      music: true,
      autoSpeak: true,
      asr: true,
      speakIn: "target",
      voiceRate: 0.92,
    };

    return Response.json({
      ...p,
      settings: { ...defaultSettings, ...p.settings },
      rankLevel: xpToRank(p.xp),
      inventory: inv,
      achievements: ach.map((a) => a.code),
      daily: daily ?? {
        date: today,
        wordsCompleted: 0,
        scoreEarned: 0,
        claimed: false,
        targetWords: 20,
        targetScore: 1500,
      },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "profile failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!isDbConfigured()) {
      return Response.json({ error: "no_db", mode: "local" }, { status: 503 });
    }
    const body = (await req.json()) as {
      clientId?: string;
      callsign?: string;
      nativeLang?: string;
      learningLang?: string;
      cefrLevel?: string;
      category?: string;
      equippedShip?: string;
      settings?: Record<string, unknown>;
    };
    if (!body.clientId) return Response.json({ error: "clientId required" }, { status: 400 });
    const [p] = await db.select().from(profiles).where(eq(profiles.clientId, body.clientId));
    if (!p) return Response.json({ error: "not found" }, { status: 404 });

    const settings = {
      ...p.settings,
      ...(body.settings ?? {}),
    };

    const [updated] = await db
      .update(profiles)
      .set({
        callsign: body.callsign ?? p.callsign,
        nativeLang: body.nativeLang ?? p.nativeLang,
        learningLang: body.learningLang ?? p.learningLang,
        cefrLevel: body.cefrLevel ?? p.cefrLevel,
        category: body.category ?? p.category,
        equippedShip: body.equippedShip ?? p.equippedShip,
        settings,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, p.id))
      .returning();

    return Response.json(updated);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "update failed" }, { status: 500 });
  }
}
