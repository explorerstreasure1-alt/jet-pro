"use client";

import { useRouter } from "next/navigation";
import { AppFrame } from "./app-frame";
import { useApp } from "./providers";

export function DailyClient() {
  const { profile, tt, reload } = useApp();
  const router = useRouter();
  const d = profile?.daily;
  if (!d) return null;

  const wordsPct = Math.min(100, Math.round((d.wordsCompleted / Math.max(1, d.targetWords)) * 100));
  const scorePct = Math.min(100, Math.round((d.scoreEarned / Math.max(1, d.targetScore)) * 100));
  const ready = d.wordsCompleted >= d.targetWords && d.scoreEarned >= d.targetScore;

  const claim = async () => {
    if (!profile) return;
    await fetch("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: profile.id }),
    });
    await reload();
  };

  const launch = () => {
    const lang = profile?.learningLang ?? "en";
    const level = profile?.cefrLevel ?? "A1";
    router.push(`/play?lang=${lang}&level=${level}&category=all&mode=daily`);
  };

  return (
    <AppFrame title={tt("dailyTitle")}>
      <div className="holo rounded-3xl p-5">
        <p className="text-[10px] tracking-[0.28em] text-white/40">{d.date}</p>
        <h2 className="font-display mt-2 text-xl tracking-[0.18em] text-cyan-100">{tt("todayProgress")}</h2>
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-sm">
            <span>{tt("dailyWords")}</span>
            <span className="font-digital">
              {d.wordsCompleted}/{d.targetWords}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-cyan-300" style={{ width: `${wordsPct}%` }} />
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm">
            <span>{tt("dailyScore")}</span>
            <span className="font-digital">
              {d.scoreEarned}/{d.targetScore}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-fuchsia-400" style={{ width: `${scorePct}%` }} />
          </div>
        </div>
        <button type="button" onClick={launch} className="holo-strong mt-6 w-full rounded-2xl py-4 font-display tracking-[0.28em]">
          {tt("start")}
        </button>
        {ready && (
          <button
            type="button"
            disabled={d.claimed}
            onClick={() => void claim()}
            className="mt-3 w-full rounded-2xl border border-amber-300/40 py-3 text-amber-200"
          >
            {d.claimed ? tt("claimed") : tt("claim")}
          </button>
        )}
        {ready && !d.claimed && <p className="mt-2 text-center text-xs text-amber-200">{tt("rewardReady")} · +90 CR · ❄</p>}
      </div>
    </AppFrame>
  );
}
