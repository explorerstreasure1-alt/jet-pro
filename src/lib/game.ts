import { BASE_SCORE, heatBand } from "./constants";
import type { WordCard } from "./types";

export function nativePrompt(word: WordCard, nativeLang: string) {
  return nativeLang === "en" ? word.translationEn : word.translationTr;
}

export function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j] as T;
    a[j] = tmp as T;
  }
  return a;
}

export function pickWeighted(pool: WordCard[], used: Set<number>) {
  const available = pool.filter((w) => !used.has(w.id));
  const source = available.length ? available : pool;
  const weights = source.map((w) => {
    const band = heatBand(w.heat);
    if (band === "ice") return 5;
    if (band === "warm") return 2.5;
    return 1;
  });
  const total = weights.reduce((s, n) => s + n, 0);
  let r = Math.random() * total;
  for (let i = 0; i < source.length; i++) {
    r -= weights[i] ?? 0;
    if (r <= 0) return source[i] as WordCard;
  }
  return source[source.length - 1] as WordCard;
}

export function pickDistractors(pool: WordCard[], target: WordCard, n: number) {
  const same = pool.filter(
    (w) => w.id !== target.id && w.conceptKey !== target.conceptKey && w.category === target.category,
  );
  const rest = pool.filter((w) => w.id !== target.id && w.conceptKey !== target.conceptKey);
  const bag = shuffle(same.length >= n ? same : rest);
  const out: WordCard[] = [];
  const seen = new Set<string>([target.conceptKey]);
  const seenTerms = new Set<string>([target.term.toLowerCase()]);
  for (const w of bag) {
    if (seen.has(w.conceptKey)) continue;
    // Some languages share one word across two concepts (e.g. RU "решение"
    // for both decision & solution) — never show two identical cards.
    if (seenTerms.has(w.term.toLowerCase())) continue;
    seen.add(w.conceptKey);
    seenTerms.add(w.term.toLowerCase());
    out.push(w);
    if (out.length >= n) break;
  }
  return out;
}

export function scoreForHit(
  combo: number,
  level: string,
  speed: "fast" | "normal" | "slow",
  doubleScore: boolean,
) {
  const levelMul = { A1: 1, A2: 1.15, B1: 1.3, B2: 1.5, C1: 1.75 }[level] ?? 1;
  const comboMul = 1 + Math.min(combo, 10) * 0.12;
  const speedMul = speed === "fast" ? 1.25 : speed === "slow" ? 1.1 : 1;
  const dbl = doubleScore ? 2 : 1;
  return Math.round(BASE_SCORE * levelMul * comboMul * speedMul * dbl);
}

export function hintMask(term: string) {
  const chars = [...term];
  let revealed = 0;
  const need = Math.max(2, Math.ceil(chars.filter((c) => c !== " ").length * 0.4));
  return chars
    .map((c) => {
      if (c === " ") return " ";
      if (revealed < need) {
        revealed += 1;
        return c;
      }
      return "•";
    })
    .join("");
}

export function xpToRank(xp: number) {
  return Math.min(99, 1 + Math.floor(xp / 400));
}
