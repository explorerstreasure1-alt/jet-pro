import { db, isDbConfigured } from "@/db";
import { sql } from "drizzle-orm";
import { words } from "@/db/schema";
import {
  LANG_INDEX,
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

    // Upsert generated rows so deployments can repair previously seeded text.
    for (const l of LANG_INDEX) {
      await seedSingleLanguage(l);
    }
  } catch (err) {
    console.warn("Database seeding notice:", err);
  }
}

async function seedSingleLanguage(lang: LangCode): Promise<void> {
  try {
    // Fast batch upsert for this language (7500 words in 5 chunks of 1500).
    const rows = expandLexicon(lang);
    for (let i = 0; i < rows.length; i += 1500) {
      const chunk = rows.slice(i, i + 1500);
      await db
        .insert(words)
        .values(chunk)
        .onConflictDoUpdate({
          target: [words.conceptKey, words.language],
          set: {
            term: sql`excluded.term`,
            translationTr: sql`excluded.translation_tr`,
            translationEn: sql`excluded.translation_en`,
            level: sql`excluded.level`,
            category: sql`excluded.category`,
            isCustom: sql`excluded.is_custom`,
          },
        });
    }

    seededLangs.add(lang);
  } catch (err) {
    console.warn(`Could not seed language ${lang}:`, err);
  }
}
