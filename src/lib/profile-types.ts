import type { ProfileRow } from "@/db/schema";

export type DailyState = {
  date: string;
  wordsCompleted: number;
  scoreEarned: number;
  claimed: boolean;
  targetWords: number;
  targetScore: number;
};

export type ClientInventory = {
  id?: number;
  profileId?: number;
  itemCode: string;
  qty: number;
};

export type ClientProfile = Omit<ProfileRow, "createdAt" | "updatedAt"> & {
  createdAt: string | Date;
  updatedAt: string | Date;
  inventory: ClientInventory[];
  achievements: string[];
  daily: DailyState;
};
