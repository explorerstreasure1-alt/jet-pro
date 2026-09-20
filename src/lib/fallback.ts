import type { ProfileSettings } from "@/db/schema";

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

const defaultSettings: ProfileSettings = {
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

export function buildFallbackProfile(clientId = "demo-user") {
  const base = {
    id: 1,
    clientId,
    callsign: "NOVA-21",
    nativeLang: "tr",
    learningLang: "en",
    cefrLevel: "A1",
    category: "all",
    credits: 160,
    highScore: 0,
    totalScore: 0,
    gamesPlayed: 0,
    wordsLearned: 0,
    streak: 0,
    lastPlayedDate: null,
    xp: 0,
    rankLevel: 1,
    equippedShip: "viper",
    settings: defaultSettings,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    ...base,
    rankLevel: 1,
    inventory: [
      { id: 1, profileId: 1, itemCode: "freeze", qty: 2 },
      { id: 2, profileId: 1, itemCode: "hint", qty: 3 },
      { id: 3, profileId: 1, itemCode: "shield", qty: 1 },
    ],
    achievements: [],
    daily: {
      date: new Date().toISOString().slice(0, 10),
      wordsCompleted: 0,
      scoreEarned: 0,
      claimed: false,
      targetWords: 20,
      targetScore: 1500,
    },
  };
}

export function buildFallbackSeries(language = "en") {
  const list = Array.from({ length: 6 }, (_, i) => {
    const number = i + 1;
    const from = i * 150 + 1;
    const to = Math.min(150 * (i + 1), 900);
    return {
      id: `s-${language}-${number}`,
      number,
      from,
      to,
      size: 150,
      waves: 15,
      completed: false,
      bestScore: 0,
      stars: 0,
      unlocked: number === 1 || i < 2,
    };
  });

  return {
    language,
    total: 900,
    size: 150,
    seriesCount: 6,
    remainder: 0,
    loop: 1,
    cefrLevel: "A1",
    levelQuota: 2,
    list,
  };
}
