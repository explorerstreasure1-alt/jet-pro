import { db } from "@/db";
import { words } from "@/db/schema";
import { and, count, eq, ilike } from "drizzle-orm";
import { TARGET_WORDS_PER_LANGUAGE, expandLexicon } from "./lexicon";

let seeding: Promise<void> | null = null;

export function ensureSeeded() {
  if (!seeding) {
    seeding = seedOnce().catch((e) => {
      // Allow a retry on the next request instead of caching the failure —
      // important on serverless where a cold start may time out mid-seed.
      seeding = null;
      throw e;
    });
  }
  return seeding;
}

async function seedOnce() {
  // Stale-generation detector: the old generator combined frames blindly and
  // produced nonsense like "I need hello". The semantic-class generator never
  // emits `hello__need`, so its presence means the lexicon must be rebuilt.
  const staleA = await db
    .select({ id: words.id })
    .from(words)
    .where(and(eq(words.conceptKey, "hello__need"), eq(words.language, "en")))
    .limit(1);
  // Second-generation bug: doubled infinitive ("I want to to drink").
  const staleB = await db
    .select({ id: words.id })
    .from(words)
    .where(and(eq(words.language, "en"), ilike(words.term, "% to to %")))
    .limit(1);
  const stale = [...staleA, ...staleB];
  if (stale.length) {
    await db.delete(words).where(eq(words.isCustom, false));
  }

  const [row] = await db.select({ c: count() }).from(words);
  const targetCount = TARGET_WORDS_PER_LANGUAGE * 7;
  const current = row ? Number(row.c) : 0;
  if (!stale.length && current >= targetCount) return;

  // Resumable idempotent seed: the (concept_key, language) unique index makes
  // re-inserts no-ops, so a timeout mid-seed simply continues next request.
  const rows = expandLexicon();
  for (let i = 0; i < rows.length; i += 1500) {
    const chunk = rows.slice(i, i + 1500);
    await db.insert(words).values(chunk).onConflictDoNothing();
  }
}
