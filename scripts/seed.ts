import { db, isDbConfigured } from "../src/db";
import { words } from "../src/db/schema";
import { LANG_INDEX, TARGET_WORDS_PER_LANGUAGE, expandLexicon } from "../src/lib/lexicon";
import { eq, sql } from "drizzle-orm";

async function main() {
  console.log("Checking database connection...");
  if (!isDbConfigured()) {
    console.error("DATABASE_URL or POSTGRES_URL is not set.");
    process.exit(1);
  }

  const [cnt] = await db.select({ c: sql<number>`count(*)::int` }).from(words);
  console.log(`Current word count: ${cnt?.c ?? 0}`);

  for (const lang of LANG_INDEX) {
    const [c] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(words)
      .where(eq(words.language, lang));
    const current = Number(c?.c ?? 0);
    console.log(`Language [${lang.toUpperCase()}]: ${current} / ${TARGET_WORDS_PER_LANGUAGE}`);

    if (current < TARGET_WORDS_PER_LANGUAGE) {
      const rows = expandLexicon(lang);
      console.log(`  Inserting ${rows.length} words for [${lang.toUpperCase()}]...`);
      for (let i = 0; i < rows.length; i += 1500) {
        const chunk = rows.slice(i, i + 1500);
        await db.insert(words).values(chunk).onConflictDoNothing();
      }
      console.log(`  Done seeding [${lang.toUpperCase()}].`);
    }
  }

  const [finalCnt] = await db.select({ c: sql<number>`count(*)::int` }).from(words);
  console.log(`Final total words: ${finalCnt?.c ?? 0} (Expected: ${TARGET_WORDS_PER_LANGUAGE * LANG_INDEX.length})`);
  console.log("Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
