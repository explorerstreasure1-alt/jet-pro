export type LangCode = "en" | "es" | "it" | "ru" | "pt" | "fr" | "de";
export type NativeCode = "tr" | "en";
export type UiLang = "tr" | "en";
export type Level = "A1" | "A2" | "B1" | "B2" | "C1";
export type WordCategory =
  | "daily"
  | "travel"
  | "food"
  | "business"
  | "tech"
  | "nature"
  | "emotions"
  | "slang"
  | "verbs"
  | "numbers"
  | "phrases";
export type Category = "all" | WordCategory;
export type GameMode = "arcade" | "daily" | "series";
export type HeatBand = "ice" | "warm" | "fire";

export type WordCard = {
  id: number;
  conceptKey: string;
  language: string;
  term: string;
  translationTr: string;
  translationEn: string;
  phonetic: string | null;
  example: string | null;
  exampleTr: string | null;
  level: string;
  category: string;
  isCustom: boolean;
  heat: number;
  correctCount: number;
  wrongCount: number;
};

export type InvaderSpeed = "fast" | "normal" | "slow";

export type Invader = {
  lane: number;
  word: WordCard;
  y: number;
  speed: InvaderSpeed;
  hp: number;
  isCorrect: boolean;
};

export type GameConfig = {
  language: LangCode;
  level: Level;
  category: Category;
  mode: GameMode;
  seriesId?: string;
  nativeLang: NativeCode;
};
