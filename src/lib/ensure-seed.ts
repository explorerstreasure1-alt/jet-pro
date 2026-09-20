import { db, isDbConfigured } from "@/db";
import { eq, sql } from "drizzle-orm";
import { words } from "@/db/schema";
import {
  LANG_INDEX,
  TARGET_WORDS_PER_LANGUAGE,
  expandLexicon,
} from "./lexicon";
import type { LangCode } from "./types";

const seededLangs = new Set<string>();
let activeSeed: Promise<void> | null = null;

export async function ensureSeeded(lang?: string): Promise<void> {
  if (!isDbConfigured()) return;
  if (lang && seededLangs.has(lang)) return;

  if (activeSeed) {
    await activeSeed;
    return;
  }

  activeSeed = seedWorker(lang as LangCode | undefined).finally(() => {
    activeSeed = null;
  });

  await activeSeed;
}

async function seedWorker(lang?: LangCode): Promise<void> {
  try {
    if (lang && LANG_INDEX.includes(lang)) {
      await seedSingleLanguage(lang);
      return;
    }

    // Check overall database count
    const [cnt] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(words)
      .catch(() => [{ c: 0 }]);
    const total = Number(cnt?.c ?? 0);
    const expectedTotal = TARGET_WORDS_PER_LANGUAGE * LANG_INDEX.length; // 52500

    if (total >= expectedTotal) {
      for (const l of LANG_INDEX) seededLangs.add(l);
      return;
    }

    // Seed missing languages one by one
    for (const l of LANG_INDEX) {
      await seedSingleLanguage(l);
    }
  } catch (err) {
    console.warn("Database seeding notice:", err);
  }
}

async function seedSingleLanguage(lang: LangCode): Promise<void> {
  try {
    const [cnt] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(words)
      .where(eq(words.language, lang))
      .catch(() => [{ c: 0 }]);

    if (cnt && Number(cnt.c) >= TARGET_WORDS_PER_LANGUAGE) {
      seededLangs.add(lang);
      return;
    }

    // Fast batch insert for this language (7500 words in 5 chunks of 1500)
    const rows = expandLexicon(lang);
    for (let i = 0; i < rows.length; i += 1500) {
      const chunk = rows.slice(i, i + 1500);
      await db.insert(words).values(chunk).onConflictDoNothing();
    }

    seededLangs.add(lang);
  } catch (err) {
    console.warn(`Could not seed language ${lang}:`, err);
  }
}
