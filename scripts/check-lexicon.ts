import { expandLexicon, LANG_INDEX, TARGET_WORDS_PER_LANGUAGE } from "../src/lib/lexicon";
import type { LangCode, Level } from "../src/lib/types";

const levels: Level[] = ["A1", "A2", "B1", "B2", "C1"];
const forbidden = [
  /undefined|null|\[object Object\]/i,
  /(?:mek|mak)(?:e|a)ceğim/i,
  /(?:mek|mak)(?:e|a)bilirim/i,
  /\b(?:el\/la|un\/una|il\/la|o\/a|le\/la|der\/die\/das|ein\/eine)\b/i,
];

let failures = 0;
for (const language of LANG_INDEX) {
  const rows = expandLexicon(language as LangCode);
  const levelCounts = Object.fromEntries(levels.map((level) => [level, 0])) as Record<Level, number>;
  const bad = rows.filter((row) => {
    levelCounts[row.level as Level] += 1;
    return (
      !row.term.trim() ||
      !row.translationTr.trim() ||
      !row.translationEn.trim() ||
      forbidden.some((pattern) => pattern.test(`${row.term} ${row.translationTr} ${row.translationEn}`))
    );
  });

  if (rows.length !== TARGET_WORDS_PER_LANGUAGE) {
    console.error(`${language}: expected ${TARGET_WORDS_PER_LANGUAGE} words, found ${rows.length}`);
    failures += 1;
  }
  for (const level of levels) {
    if (!levelCounts[level]) {
      console.error(`${language}: missing level ${level}`);
      failures += 1;
    }
  }
  if (bad.length) {
    console.error(`${language}: ${bad.length} invalid generated records`);
    for (const row of bad.slice(0, 5)) console.error(`  ${row.conceptKey}: ${row.term}`);
    failures += bad.length;
  }
  console.log(`${language}: ${rows.length} records`, levelCounts);
}

if (failures) process.exit(1);
console.log("Lexicon quality check passed.");
