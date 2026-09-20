"use client";

import type { ProfileSettings, SessionRow } from "@/db/schema";
import {
  ACHIEVEMENTS,
  SHOP_ITEMS,
  SERIES_SIZE,
  SERIES_WAVES,
  randomCallsign,
  todayIso,
} from "./constants";
import { cefrRank, seriesIsUnlocked, xpToRank } from "./game";
import { expandLexicon, type SeedWord } from "./lexicon";
import type { ClientInventory, ClientProfile, DailyState } from "./profile-types";
import type { LangCode, WordCard } from "./types";

let dbAvailable: boolean | null = null;

/** Probe the backend once; if no database is provisioned, stay local-only
 *  (no failing network calls) — keeps Vercel deploys clean and fast. */
export async function probeDb(): Promise<boolean> {
  try {
    const res = await fetch("/api/health");
    const data = (await res.json()) as { db?: boolean };
    dbAvailable = data.db !== false;
  } catch {
    dbAvailable = false;
  }
  return dbAvailable;
}

async function tryNetwork<T>(fn: () => Promise<T>, local: () => T | Promise<T>): Promise<T> {
  if (dbAvailable === false) return local();
  try {
    return await fn();
  } catch (e) {
    // Network/API failure (e.g. no DB on Vercel): switch fully to local mode.
    dbAvailable = false;
    return local();
  }
}

const CLIENT_KEY = "wi_client";
const PROFILE_KEY = "wi_profile";
const PROGRESS_KEY = "wi_progress";
const SESSIONS_KEY = "wi_sessions";
const SERIES_KEY = "wi_series";
const CUSTOM_KEY = "wi_custom_words";

export function getClientId() {
  let id = localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable */
  }
}

export const defaultSettings: ProfileSettings = {
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

function defaultDaily(): DailyState {
  return {
    date: todayIso(),
    wordsCompleted: 0,
    scoreEarned: 0,
    claimed: false,
    targetWords: 20,
    targetScore: 1500,
  };
}

/* ---------------- profile ---------------- */

export function localProfile(): ClientProfile {
  const existing = read<ClientProfile | null>(PROFILE_KEY, null);
  if (existing) {
    if (!existing.daily || existing.daily.date !== todayIso()) {
      const yesterday = new Date(`${todayIso()}T00:00:00.000Z`);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const y = yesterday.toISOString().slice(0, 10);
      existing.streak = existing.lastPlayedDate === y ? existing.streak : existing.lastPlayedDate === todayIso() ? existing.streak : 1;
      existing.lastPlayedDate = todayIso();
      existing.daily = defaultDaily();
    }
    existing.settings = { ...defaultSettings, ...existing.settings };
    write(PROFILE_KEY, existing);
    return existing;
  }

  const now = new Date().toISOString();
  const p: ClientProfile = {
    id: 1,
    clientId: getClientId(),
    callsign: randomCallsign(),
    nativeLang: "tr",
    learningLang: "en",
    cefrLevel: "B1",
    category: "all",
    credits: 160,
    highScore: 0,
    totalScore: 0,
    gamesPlayed: 0,
    wordsLearned: 0,
    streak: 1,
    lastPlayedDate: todayIso(),
    xp: 0,
    rankLevel: 1,
    equippedShip: "viper",
    settings: defaultSettings,
    createdAt: now,
    updatedAt: now,
    inventory: [
      { itemCode: "freeze", qty: 2 },
      { itemCode: "hint", qty: 3 },
      { itemCode: "shield", qty: 1 },
    ],
    achievements: [],
    daily: defaultDaily(),
  };
  write(PROFILE_KEY, p);
  return p;
}

function saveProfile(p: ClientProfile) {
  p.settings = { ...defaultSettings, ...p.settings };
  p.updatedAt = new Date().toISOString();
  p.rankLevel = xpToRank(p.xp);
  write(PROFILE_KEY, p);
}

export async function fetchProfile(): Promise<ClientProfile> {
  if (dbAvailable === false) return localProfile();
  try {
    const res = await fetch(`/api/profile?clientId=${encodeURIComponent(getClientId())}`);
    if (!res.ok) throw new Error("profile");
    return (await res.json()) as ClientProfile;
  } catch {
    dbAvailable = false;
    return localProfile();
  }
}

export async function patchProfile(body: Record<string, unknown>): Promise<ClientProfile> {
  if (dbAvailable === false) {
    const p = localProfile();
    if (body.settings) p.settings = { ...p.settings, ...(body.settings as Partial<ProfileSettings>) };
    for (const k of ["callsign", "nativeLang", "learningLang", "cefrLevel", "category", "equippedShip"] as const) {
      if (body[k] !== undefined) (p as unknown as Record<string, unknown>)[k] = body[k];
    }
    saveProfile(p);
    return p;
  }
  try {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: getClientId(), ...body }),
    });
    if (!res.ok) throw new Error("patch");
    return (await res.json()) as ClientProfile;
  } catch {
    dbAvailable = false;
    const p = localProfile();
    if (body.settings) p.settings = { ...p.settings, ...(body.settings as Partial<ProfileSettings>) };
    for (const k of [
      "callsign",
      "nativeLang",
      "learningLang",
      "cefrLevel",
      "category",
      "equippedShip",
    ] as const) {
      if (body[k] !== undefined) (p as unknown as Record<string, unknown>)[k] = body[k];
    }
    saveProfile(p);
    return p;
  }
}

/* ---------------- lexicon ---------------- */

const langLexiconCache = new Map<string, WordCard[]>();

export function localLexicon(targetLang?: string): WordCard[] {
  if (targetLang) {
    const existing = langLexiconCache.get(targetLang);
    if (existing) return existing;
    const raw: (SeedWord & { id: number })[] = expandLexicon(targetLang as LangCode).map((w, i) => ({
      ...w,
      id: i + 1,
    }));
    const customs = read<(SeedWord & { id: number })[]>(CUSTOM_KEY, []).filter(
      (c) => c.language === targetLang,
    );
    const progress = read<Record<number, LocalProgress>>(PROGRESS_KEY, {});
    const combined = [...raw, ...customs].map((w) => {
      const p = progress[w.id];
      return {
        ...w,
        phonetic: null,
        example: null,
        exampleTr: null,
        heat: p?.heat ?? 0,
        correctCount: p?.correctCount ?? 0,
        wrongCount: p?.wrongCount ?? 0,
      };
    });
    langLexiconCache.set(targetLang, combined);
    return combined;
  }

  let all: WordCard[] = [];
  for (const l of ["en", "es", "it", "ru", "pt", "fr", "de"]) {
    all = all.concat(localLexicon(l));
  }
  return all;
}

type WordQuery = {
  language?: string;
  level?: string;
  category?: string;
  q?: string;
  profileId?: string;
  offset?: number;
  limit?: number;
};

export async function fetchWords(query: WordQuery): Promise<WordCard[]> {
  if (dbAvailable === false) return filterLocalWords(query);
  try {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    const res = await fetch(`/api/words?${qs.toString()}`);
    if (!res.ok) throw new Error("words");
    const data = (await res.json()) as WordCard[] | { error?: string };
    if (!Array.isArray(data)) throw new Error("words");
    return data;
  } catch {
    dbAvailable = false;
    return filterLocalWords(query);
  }
}

function filterLocalWords(q: WordQuery): WordCard[] {
  let rows = localLexicon(q.language);
  if (q.language) rows = rows.filter((w) => w.language === q.language);
  if (q.level && q.level !== "all") rows = rows.filter((w) => w.level === q.level);
  if (q.category && q.category !== "all") rows = rows.filter((w) => w.category === q.category);
  if (q.q) {
    const needle = q.q.toLowerCase();
    rows = rows.filter(
      (w) =>
        w.term.toLowerCase().includes(needle) ||
        w.translationTr.toLowerCase().includes(needle) ||
        w.translationEn.toLowerCase().includes(needle),
    );
  }
  if (q.offset !== undefined || q.limit !== undefined) {
    const start = q.offset ?? 0;
    rows = rows.slice().sort((a, b) => cefrRank(a.level) - cefrRank(b.level) || a.id - b.id);
    const end = q.limit ? start + q.limit : undefined;
    rows = rows.slice(start, end);
  }
  return rows;
}

export async function addCustomWord(input: {
  language: string;
  term: string;
  translationTr: string;
  translationEn?: string;
  level?: string;
  category?: string;
}): Promise<void> {
  try {
    const res = await fetch("/api/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("add");
  } catch {
    const customs = read<(SeedWord & { id: number })[]>(CUSTOM_KEY, []);
    const base = localLexicon() as (SeedWord & { id: number })[];
    customs.push({
      id: base.length + customs.length + 1,
      conceptKey: `custom-${Date.now()}`,
      language: input.language as SeedWord["language"],
      term: input.term,
      translationTr: input.translationTr,
      translationEn: input.translationEn ?? input.term,
      level: (input.level as SeedWord["level"]) ?? "A1",
      category: (input.category as SeedWord["category"]) ?? "daily",
      isCustom: true,
    });
    write(CUSTOM_KEY, customs);
    langLexiconCache.clear();
  }
}

/* ---------------- progress ---------------- */

type LocalProgress = { heat: number; correctCount: number; wrongCount: number; lastSeenAt: string };

export async function saveProgress(
  profileId: number,
  results: { wordId: number; correct: boolean }[],
  reset = false,
): Promise<{ ok: boolean; mastered: number }> {
  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, results, reset }),
    });
    if (!res.ok) throw new Error("progress");
    return (await res.json()) as { ok: boolean; mastered: number };
  } catch {
    dbAvailable = false;
    const map = reset ? {} : read<Record<number, LocalProgress>>(PROGRESS_KEY, {});
    for (const r of results) {
      const cur = map[r.wordId] ?? { heat: 0, correctCount: 0, wrongCount: 0, lastSeenAt: "" };
      cur.heat = Math.max(0, Math.min(100, cur.heat + (r.correct ? 18 : -12)));
      cur.correctCount += r.correct ? 1 : 0;
      cur.wrongCount += r.correct ? 0 : 1;
      cur.lastSeenAt = new Date().toISOString();
      map[r.wordId] = cur;
    }
    write(PROGRESS_KEY, map);
    const mastered = Object.values(map).filter((p) => p.heat >= 70).length;
    const p = localProfile();
    p.wordsLearned = mastered;
    saveProfile(p);
    return { ok: true, mastered };
  }
}

/* ---------------- sessions ---------------- */

type SessionInput = {
  profileId: number;
  language: string;
  level: string;
  category: string;
  mode: string;
  seriesId?: string | null;
  score: number;
  wavesCompleted: number;
  maxCombo: number;
  wordsCorrect: number;
  wordsWrong: number;
  livesLeft: number;
  durationMs: number;
  won: boolean;
};

export async function postSession(
  body: SessionInput,
): Promise<{ xpGain: number; creditGain: number; unlocked: string[]; newRecord: boolean }> {
  try {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("session");
    const data = (await res.json()) as {
      xpGain?: number;
      creditGain?: number;
      unlocked?: string[];
      newRecord?: boolean;
    };
    return {
      xpGain: data.xpGain ?? 0,
      creditGain: data.creditGain ?? 0,
      unlocked: data.unlocked ?? [],
      newRecord: Boolean(data.newRecord),
    };
  } catch {
    dbAvailable = false;
    return localSession(body);
  }
}

function localSession(body: SessionInput) {
  const p = localProfile();
  const xpGain = body.wordsCorrect * 12 + (body.won ? 80 : 20) + Math.floor(body.score / 50);
  const creditGain = 12 + body.wordsCorrect * 2 + (body.won ? 25 : 0) + (body.maxCombo >= 8 ? 15 : 0);
  const newRecord = body.score > p.highScore;
  p.credits += creditGain;
  p.highScore = Math.max(p.highScore, body.score);
  p.totalScore += body.score;
  p.gamesPlayed += 1;
  p.xp += xpGain;
  p.daily.wordsCompleted += body.wordsCorrect;
  p.daily.scoreEarned += body.score;
  const sessions = read<SessionRow[]>(SESSIONS_KEY, []);
  sessions.unshift({
    id: sessions.length + 1,
    profileId: p.id,
    language: body.language,
    level: body.level,
    category: body.category,
    mode: body.mode,
    seriesId: body.seriesId ?? null,
    score: body.score,
    wavesCompleted: body.wavesCompleted,
    maxCombo: body.maxCombo,
    wordsCorrect: body.wordsCorrect,
    wordsWrong: body.wordsWrong,
    livesLeft: body.livesLeft,
    durationMs: body.durationMs,
    createdAt: new Date(),
  });
  write(SESSIONS_KEY, sessions.slice(0, 100));

  if (body.seriesId && body.won) {
    const sp = read<Record<string, { completed: boolean; bestScore: number; stars: number }>>(SERIES_KEY, {});
    const stars = body.livesLeft >= 70 ? 3 : body.livesLeft >= 40 ? 2 : 1;
    const cur = sp[body.seriesId];
    sp[body.seriesId] = {
      completed: true,
      bestScore: Math.max(cur?.bestScore ?? 0, body.score),
      stars: Math.max(cur?.stars ?? 0, stars),
    };
    write(SERIES_KEY, sp);
  }

  const unlocked: string[] = [];
  const want: string[] = [];
  if (body.wordsCorrect > 0) want.push("first_blood");
  if (body.maxCombo >= 5) want.push("combo_5");
  if (body.maxCombo >= 10) want.push("combo_10");
  if (body.won && body.wordsWrong === 0) want.push("perfect_wave");
  const total = body.wordsCorrect + body.wordsWrong;
  if (body.won && total > 0 && body.wordsCorrect / total >= 0.9) want.push("sharpshooter");
  if (body.won && body.livesLeft >= 50) want.push("survivor");
  if (body.won && body.level === "C1") want.push("c1_clear");
  for (const code of want) {
    if (!p.achievements.includes(code)) {
      p.achievements.push(code);
      unlocked.push(code);
    }
  }
  saveProfile(p);
  return { xpGain, creditGain, unlocked, newRecord };
}

export async function fetchSessions(profileId: number): Promise<SessionRow[]> {
  try {
    const res = await fetch(`/api/sessions?profileId=${profileId}`);
    if (!res.ok) throw new Error("sessions");
    return (await res.json()) as SessionRow[];
  } catch {
    dbAvailable = false;
    return read<SessionRow[]>(SESSIONS_KEY, []);
  }
}

/* ---------------- shop ---------------- */

export async function shopBuy(profileId: number, itemCode: string, equip = false) {
  try {
    const res = await fetch("/api/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, itemCode, equip }),
    });
    if (!res.ok) throw new Error("shop");
    return (await res.json()) as { profile?: ClientProfile; inventory?: ClientInventory[] };
  } catch {
    dbAvailable = false;
    return localShop(profileId, itemCode, equip);
  }
}

function localShop(profileId: number, itemCode: string, equip: boolean) {
  const p = localProfile();
  if (equip) {
    if (itemCode !== "viper" && !p.inventory.some((i) => i.itemCode === itemCode)) {
      throw new Error("not owned");
    }
    p.equippedShip = itemCode.replace("ship_", "");
    saveProfile(p);
    return { profile: p };
  }
  const item = SHOP_ITEMS.find((i) => i.code === itemCode);
  if (!item) throw new Error("item");
  if (p.credits < item.price) throw new Error("credits");
  const existing = p.inventory.find((i) => i.itemCode === itemCode);
  const cosmetic = "cosmetic" in item && item.cosmetic;
  if (cosmetic && existing) throw new Error("owned");
  p.credits -= item.price;
  if (existing) existing.qty += item.qty;
  else p.inventory.push({ itemCode, qty: item.qty });
  if (!p.achievements.includes("shopper")) p.achievements.push("shopper");
  saveProfile(p);
  return { profile: p, inventory: p.inventory };
}

export async function consumeItem(profileId: number, itemCode: string, delta = -1) {
  try {
    const res = await fetch("/api/shop", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, itemCode, delta }),
    });
    if (!res.ok) throw new Error("consume");
    return;
  } catch {
    dbAvailable = false;
    const p = localProfile();
    const item = p.inventory.find((i) => i.itemCode === itemCode);
    if (!item || item.qty + delta < 0) return;
    item.qty += delta;
    saveProfile(p);
  }
}

/* ---------------- daily ---------------- */

export async function claimDaily(profileId: number) {
  try {
    const res = await fetch("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId }),
    });
    if (!res.ok) throw new Error("daily");
    return (await res.json()) as { ok: boolean };
  } catch {
    dbAvailable = false;
    const p = localProfile();
    const d = p.daily;
    if (d.claimed || d.wordsCompleted < d.targetWords || d.scoreEarned < d.targetScore) {
      throw new Error("incomplete");
    }
    d.claimed = true;
    p.credits += 90;
    const f = p.inventory.find((i) => i.itemCode === "freeze");
    if (f) f.qty += 1;
    else p.inventory.push({ itemCode: "freeze", qty: 1 });
    saveProfile(p);
    return { ok: true };
  }
}

/* ---------------- series ---------------- */

export type SeriesEntry = {
  id: string;
  number: number;
  level?: string;
  from: number;
  to: number;
  size: number;
  waves: number;
  completed: boolean;
  bestScore: number;
  stars: number;
  unlocked: boolean;
};

export type SeriesData = {
  language: string;
  total: number;
  size: number;
  seriesCount: number;
  remainder: number;
  loop: number;
  learnerLevel?: string;
  list: SeriesEntry[];
};

export async function fetchSeries(profileId: number, language: string) {
  try {
    const res = await fetch(`/api/series?profileId=${profileId}&language=${language}`);
    if (!res.ok) throw new Error("series");
    return (await res.json()) as {
      language: string;
      total: number;
      size: number;
      seriesCount: number;
      remainder: number;
      loop: number;
      list: SeriesEntry[];
    };
  } catch {
    dbAvailable = false;
    const all = localLexicon()
      .filter((w) => w.language === language)
      .sort((a, b) => cefrRank(a.level) - cefrRank(b.level) || a.id - b.id);
    const total = all.length;
    const seriesCount = Math.floor(total / SERIES_SIZE);
    const sp = read<Record<string, { completed: boolean; bestScore: number; stars: number }>>(SERIES_KEY, {});
    const prefix = `s-${language}-`;
    let completed = 0;
    const learnerRank = Math.max(3, cefrRank(localProfile().cefrLevel));
    const CEFR = ["A1", "A2", "B1", "B2", "C1"];
    const list: SeriesEntry[] = Array.from({ length: seriesCount }, (_, i) => {
      const n = i + 1;
      const slice = all.slice(i * SERIES_SIZE, (i + 1) * SERIES_SIZE);
      const entryRank = slice.length ? Math.min(...slice.map((w) => cefrRank(w.level))) : 1;
      const cur = sp[`${prefix}${n}`];
      if (cur?.completed) completed += 1;
      const prev = i > 0 && Boolean(sp[`${prefix}${n - 1}`]?.completed);
      return {
        id: `${prefix}${n}`,
        number: n,
        level: CEFR[entryRank - 1],
        from: i * SERIES_SIZE + 1,
        to: Math.min(total, (i + 1) * SERIES_SIZE),
        size: SERIES_SIZE,
        waves: SERIES_WAVES,
        completed: Boolean(cur?.completed),
        bestScore: cur?.bestScore ?? 0,
        stars: cur?.stars ?? 0,
        unlocked: seriesIsUnlocked({ index: i, entryRank, learnerRank, previousCompleted: prev }),
      };
    });
    return {
      language,
      total,
      size: SERIES_SIZE,
      seriesCount,
      remainder: total % SERIES_SIZE,
      loop: seriesCount ? Math.floor(completed / seriesCount) + 1 : 1,
      learnerLevel: localProfile().cefrLevel,
      freeThroughLevel: "B1",
      list,
    };
  }
}

export { ACHIEVEMENTS };
