import { db } from "@/db";
import { words } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { TARGET_WORDS_PER_LANGUAGE, expandLexicon } from "./lexicon";

let seeding: Promise<void> | null = null;

export function ensureSeeded() {
  if (!seeding) seeding = seedOnce();
  return seeding;
}

async function seedOnce() {
  const [row] = await db.select({ c: count() }).from(words);
  const targetCount = TARGET_WORDS_PER_LANGUAGE * 7;
  if (row && Number(row.c) >= targetCount) return;

  await db.delete(words).where(eq(words.isCustom, false));
  const rows = expandLexicon();

  for (let i = 0; i < rows.length; i += 1000) {
    const chunk = rows.slice(i, i + 1000);
    await db.insert(words).values(chunk).onConflictDoNothing();
  }
}
