"use client";

import { ACHIEVEMENTS, padScore } from "@/lib/constants";
import { fetchSessions } from "@/lib/data";
import type { SessionRow } from "@/db/schema";
import { useEffect, useState } from "react";
import { AppFrame } from "./app-frame";
import { useApp } from "./providers";

export function StatsClient() {
  const { profile, tt, ui } = useApp();
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  useEffect(() => {
    if (!profile) return;
    let live = true;
    fetchSessions(profile.id).then((d) => {
      if (live) setSessions(d);
    });
    return () => {
      live = false;
    };
  }, [profile]);

  const hits = sessions.reduce((s, x) => s + x.wordsCorrect, 0);
  const miss = sessions.reduce((s, x) => s + x.wordsWrong, 0);
  const acc = hits + miss ? Math.round((hits / (hits + miss)) * 100) : 0;

  return (
    <AppFrame title={tt("stats")}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile k={tt("games")} v={String(profile?.gamesPlayed ?? 0)} />
        <Tile k={tt("highScore")} v={padScore(profile?.highScore ?? 0)} />
        <Tile k={tt("learned")} v={String(profile?.wordsLearned ?? 0)} />
        <Tile k={tt("accuracy")} v={`${acc}%`} />
      </div>
      <h3 className="font-display mb-3 mt-8 tracking-[0.22em] text-cyan-200">{tt("achievements")}</h3>
      <div className="grid gap-2">
        {ACHIEVEMENTS.map((a) => {
          const on = profile?.achievements.includes(a.code);
          return (
            <div key={a.code} className={`holo rounded-xl p-3 ${on ? "" : "opacity-40"}`}>
              <p className="text-sm text-cyan-50">{ui === "en" ? a.nameEn : a.nameTr}</p>
              <p className="text-xs text-white/45">{ui === "en" ? a.descEn : a.descTr}</p>
            </div>
          );
        })}
      </div>
      <h3 className="font-display mb-3 mt-8 tracking-[0.22em] text-cyan-200">{tt("games")}</h3>
      <ul className="space-y-2">
        {sessions.map((s) => (
          <li key={s.id} className="holo flex items-center justify-between rounded-xl px-3 py-2 text-sm">
            <span>
              {s.language.toUpperCase()} · {s.level} · {s.mode}
            </span>
            <span className="font-digital text-cyan-100">{padScore(s.score)}</span>
          </li>
        ))}
      </ul>
    </AppFrame>
  );
}

function Tile({ k, v }: { k: string; v: string }) {
  return (
    <div className="holo rounded-2xl p-3">
      <p className="text-[10px] tracking-[0.2em] text-white/40">{k}</p>
      <p className="font-digital mt-1 text-xl text-cyan-100">{v}</p>
    </div>
  );
}
