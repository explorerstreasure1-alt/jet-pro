import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export type ProfileSettings = {
  uiLang: "tr" | "en";
  fontScale: number;
  highContrast: boolean;
  eyeProtect: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  sfx: boolean;
  music: boolean;
  autoSpeak: boolean;
  asr: boolean;
  speakIn: "target" | "native";
  voiceRate: number;
};

export const words = pgTable(
  "words",
  {
    id: serial("id").primaryKey(),
    conceptKey: text("concept_key").notNull(),
    language: text("language").notNull(),
    term: text("term").notNull(),
    translationTr: text("translation_tr").notNull(),
    translationEn: text("translation_en").notNull(),
    phonetic: text("phonetic"),
    example: text("example"),
    exampleTr: text("example_tr"),
    level: text("level").notNull(),
    category: text("category").notNull(),
    isCustom: boolean("is_custom").notNull().default(false),
  },
  (t) => ({
    langLevelIdx: index("words_lang_level_idx").on(t.language, t.level, t.category),
    langIdIdx: index("words_lang_id_idx").on(t.language, t.id),
    conceptLangUq: uniqueIndex("words_concept_lang_uq").on(t.conceptKey, t.language),
  }),
);

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull().unique(),
  callsign: text("callsign").notNull().default("NOVA-01"),
  nativeLang: text("native_lang").notNull().default("tr"),
  learningLang: text("learning_lang").notNull().default("en"),
  cefrLevel: text("cefr_level").notNull().default("A1"),
  category: text("category").notNull().default("all"),
  credits: integer("credits").notNull().default(160),
  highScore: integer("high_score").notNull().default(0),
  totalScore: integer("total_score").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  wordsLearned: integer("words_learned").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  lastPlayedDate: text("last_played_date"),
  xp: integer("xp").notNull().default(0),
  rankLevel: integer("rank_level").notNull().default(1),
  equippedShip: text("equipped_ship").notNull().default("viper"),
  settings: jsonb("settings").$type<ProfileSettings>().notNull().default({
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
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const wordProgress = pgTable(
  "word_progress",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id").notNull(),
    wordId: integer("word_id").notNull(),
    heat: integer("heat").notNull().default(0),
    correctCount: integer("correct_count").notNull().default(0),
    wrongCount: integer("wrong_count").notNull().default(0),
    lastSeenAt: timestamp("last_seen_at"),
  },
  (t) => ({
    profileWordUq: uniqueIndex("progress_profile_word_uq").on(t.profileId, t.wordId),
    profileIdx: index("progress_profile_idx").on(t.profileId),
  }),
);

export const gameSessions = pgTable(
  "game_sessions",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id").notNull(),
    language: text("language").notNull(),
    level: text("level").notNull(),
    category: text("category").notNull(),
    mode: text("mode").notNull().default("arcade"),
    seriesId: text("series_id"),
    score: integer("score").notNull().default(0),
    wavesCompleted: integer("waves_completed").notNull().default(0),
    maxCombo: integer("max_combo").notNull().default(0),
    wordsCorrect: integer("words_correct").notNull().default(0),
    wordsWrong: integer("words_wrong").notNull().default(0),
    livesLeft: integer("lives_left").notNull().default(0),
    durationMs: integer("duration_ms").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    profileIdx: index("sessions_profile_idx").on(t.profileId),
  }),
);

export const dailyLogs = pgTable(
  "daily_logs",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id").notNull(),
    date: text("date").notNull(),
    wordsCompleted: integer("words_completed").notNull().default(0),
    scoreEarned: integer("score_earned").notNull().default(0),
    claimed: boolean("claimed").notNull().default(false),
    targetWords: integer("target_words").notNull().default(20),
    targetScore: integer("target_score").notNull().default(1500),
  },
  (t) => ({
    profileDateUq: uniqueIndex("daily_profile_date_uq").on(t.profileId, t.date),
  }),
);

export const achievements = pgTable(
  "achievements",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id").notNull(),
    code: text("code").notNull(),
    unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
  },
  (t) => ({
    profileCodeUq: uniqueIndex("ach_profile_code_uq").on(t.profileId, t.code),
  }),
);

export const inventory = pgTable(
  "inventory",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id").notNull(),
    itemCode: text("item_code").notNull(),
    qty: integer("qty").notNull().default(0),
  },
  (t) => ({
    profileItemUq: uniqueIndex("inv_profile_item_uq").on(t.profileId, t.itemCode),
  }),
);

export const seriesProgress = pgTable(
  "series_progress",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id").notNull(),
    seriesId: text("series_id").notNull(),
    completed: boolean("completed").notNull().default(false),
    bestScore: integer("best_score").notNull().default(0),
    stars: integer("stars").notNull().default(0),
  },
  (t) => ({
    profileSeriesUq: uniqueIndex("series_profile_uq").on(t.profileId, t.seriesId),
  }),
);

export type WordRow = typeof words.$inferSelect;
export type ProfileRow = typeof profiles.$inferSelect;
export type ProgressRow = typeof wordProgress.$inferSelect;
export type SessionRow = typeof gameSessions.$inferSelect;
export type DailyRow = typeof dailyLogs.$inferSelect;
export type AchievementRow = typeof achievements.$inferSelect;
export type InventoryRow = typeof inventory.$inferSelect;
export type SeriesProgressRow = typeof seriesProgress.$inferSelect;
