import type { Category, LangCode, Level } from "./types";

export const LANGS: { code: LangCode; nameTr: string; nameEn: string; flag: string; bcp47: string }[] = [
  { code: "en", nameTr: "İngilizce", nameEn: "English", flag: "🇬🇧", bcp47: "en-US" },
  { code: "es", nameTr: "İspanyolca", nameEn: "Spanish", flag: "🇪🇸", bcp47: "es-ES" },
  { code: "it", nameTr: "İtalyanca", nameEn: "Italian", flag: "🇮🇹", bcp47: "it-IT" },
  { code: "ru", nameTr: "Rusça", nameEn: "Russian", flag: "🇷🇺", bcp47: "ru-RU" },
  { code: "pt", nameTr: "Portekizce", nameEn: "Portuguese", flag: "🇵🇹", bcp47: "pt-BR" },
  { code: "fr", nameTr: "Fransızca", nameEn: "French", flag: "🇫🇷", bcp47: "fr-FR" },
  { code: "de", nameTr: "Almanca", nameEn: "German", flag: "🇩🇪", bcp47: "de-DE" },
];

export const LEVELS: { code: Level; nameTr: string; nameEn: string }[] = [
  { code: "A1", nameTr: "Başlangıç", nameEn: "Beginner" },
  { code: "A2", nameTr: "Temel", nameEn: "Elementary" },
  { code: "B1", nameTr: "Orta", nameEn: "Intermediate" },
  { code: "B2", nameTr: "Üst Orta", nameEn: "Upper Intermediate" },
  { code: "C1", nameTr: "İleri", nameEn: "Advanced" },
];

export const CATEGORIES: { code: Category; nameTr: string; nameEn: string; icon: string }[] = [
  { code: "all", nameTr: "Tüm Kelimeler", nameEn: "All Words", icon: "✦" },
  { code: "daily", nameTr: "Günlük Hayat", nameEn: "Daily Life", icon: "⌂" },
  { code: "travel", nameTr: "Seyahat", nameEn: "Travel", icon: "✈" },
  { code: "food", nameTr: "Yemek", nameEn: "Food", icon: "⌘" },
  { code: "business", nameTr: "İş Dünyası", nameEn: "Business", icon: "▣" },
  { code: "tech", nameTr: "Teknoloji", nameEn: "Technology", icon: "◈" },
  { code: "nature", nameTr: "Doğa", nameEn: "Nature", icon: "❋" },
  { code: "emotions", nameTr: "Duygular", nameEn: "Emotions", icon: "♡" },
  { code: "slang", nameTr: "Sokak Dili", nameEn: "Slang", icon: "⚡" },
  { code: "verbs", nameTr: "Fiiller", nameEn: "Verbs", icon: "➤" },
  { code: "numbers", nameTr: "Sayı / Saat", nameEn: "Numbers & Time", icon: "#" },
  { code: "phrases", nameTr: "Kalıplar", nameEn: "Phrases", icon: "❝" },
];

export const WAVES_ARCADE = 4;
export const WORDS_PER_WAVE = 10;
export const SERIES_SIZE = 150;
export const SERIES_WAVES = 15;
export const MAX_HP = 100;
export const MISS_DAMAGE = 14;
export const WRONG_SHOT_DAMAGE = 12;
export const LEAK_DAMAGE = 10;
export const BASE_SCORE = 120;
export const HIT_LINE = 78;
export const START_Y = 6;

export const SHOP_ITEMS = [
  {
    code: "freeze",
    nameTr: "Buz Işını",
    nameEn: "Freeze Ray",
    descTr: "Düşmanları 5 saniye yavaşlatır. 3 adet.",
    descEn: "Slows invaders for 5 seconds. Pack of 3.",
    price: 70,
    qty: 3,
    icon: "❄",
  },
  {
    code: "hint",
    nameTr: "İpucu Paketi",
    nameEn: "Hint Pack",
    descTr: "Doğru şeridi ve harfleri fısıldar. 5 adet.",
    descEn: "Whispers the correct lane and letters. Pack of 5.",
    price: 55,
    qty: 5,
    icon: "💡",
  },
  {
    code: "shield",
    nameTr: "Kalkan",
    nameEn: "Shield",
    descTr: "Bir sonraki hasarı emer. 2 adet.",
    descEn: "Absorbs the next hit. Pack of 2.",
    price: 90,
    qty: 2,
    icon: "◈",
  },
  {
    code: "ship_aurora",
    nameTr: "Aurora Gövde",
    nameEn: "Aurora Hull",
    descTr: "Macenta-neon gemi kaplaması.",
    descEn: "Magenta neon ship skin.",
    price: 240,
    qty: 1,
    icon: "▲",
    cosmetic: true,
  },
  {
    code: "ship_gold",
    nameTr: "Altın Viper",
    nameEn: "Gold Viper",
    descTr: "Efsanevi altın savaşçı gövdesi.",
    descEn: "Legendary gold fighter hull.",
    price: 380,
    qty: 1,
    icon: "▲",
    cosmetic: true,
  },
  {
    code: "double",
    nameTr: "Çift Skor Çekirdeği",
    nameEn: "Double Score Core",
    descTr: "Bir görev boyunca puanları 2x yapar.",
    descEn: "Doubles score for one mission.",
    price: 120,
    qty: 1,
    icon: "★",
  },
] as const;



export const ACHIEVEMENTS = [
  { code: "first_blood", nameTr: "İlk Ateş", nameEn: "First Fire", descTr: "İlk doğru atışı yap.", descEn: "Land your first correct shot." },
  { code: "combo_5", nameTr: "Combo 5", nameEn: "Combo 5", descTr: "5'li seri yakala.", descEn: "Hit a 5-streak combo." },
  { code: "combo_10", nameTr: "Nöral Akış", nameEn: "Neural Flow", descTr: "10'lu combo.", descEn: "Reach a 10 combo." },
  { code: "perfect_wave", nameTr: "Kusursuz Dalga", nameEn: "Perfect Wave", descTr: "Bir dalgayı hasarsız bitir.", descEn: "Clear a wave without damage." },
  { code: "polyglot", nameTr: "Poliglot", nameEn: "Polyglot", descTr: "3 farklı dilde görev tamamla.", descEn: "Finish missions in 3 languages." },
  { code: "streak_3", nameTr: "Ritim", nameEn: "Rhythm", descTr: "3 günlük seri.", descEn: "A 3-day streak." },
  { code: "streak_7", nameTr: "Haftalık Protokol", nameEn: "Weekly Protocol", descTr: "7 günlük seri.", descEn: "A 7-day streak." },
  { code: "lexicon_25", nameTr: "Sözlük 25", nameEn: "Lexicon 25", descTr: "25 kelimeyi alev seviyesine çıkar.", descEn: "Master 25 words to fire heat." },
  { code: "sharpshooter", nameTr: "Keskin Nişancı", nameEn: "Sharpshooter", descTr: "%90 isabetle bir görev bitir.", descEn: "Finish a mission at 90% accuracy." },
  { code: "survivor", nameTr: "Hayatta Kalan", nameEn: "Survivor", descTr: "50+ can ile zafer.", descEn: "Win with 50+ HP." },
  { code: "c1_clear", nameTr: "C1 Kilit", nameEn: "C1 Lock", descTr: "C1 görevi tamamla.", descEn: "Complete a C1 mission." },
  { code: "shopper", nameTr: "Cephanelik", nameEn: "Armory", descTr: "Mağazadan bir şey al.", descEn: "Buy something from the shop." },
];

export const CALLSIGNS = ["NOVA", "VIPER", "PULSE", "ORBIT", "NEON", "ASTRAL", "QUASAR", "ION", "ECHO", "LYRA"];

export function heatBand(heat: number): "ice" | "warm" | "fire" {
  if (heat >= 70) return "fire";
  if (heat >= 25) return "warm";
  return "ice";
}

export function langMeta(code: string) {
  return LANGS.find((l) => l.code === code) ?? LANGS[0];
}

export function todayIso(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function padScore(n: number) {
  return Math.max(0, Math.floor(n)).toString().padStart(6, "0");
}

export function randomCallsign() {
  const p = CALLSIGNS[Math.floor(Math.random() * CALLSIGNS.length)];
  const n = Math.floor(Math.random() * 90 + 10);
  return `${p}-${n}`;
}
