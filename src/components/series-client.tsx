"use client";

import { LANGS, padScore } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppFrame } from "./app-frame";
import { useApp } from "./providers";

type SeriesEntry = {
  id: string;
  number: number;
  from: number;
  to: number;
  size: number;
  waves: number;
  completed: boolean;
  bestScore: number;
  stars: number;
  unlocked: boolean;
};

type SeriesData = {
  language: string;
  total: number;
  size: number;
  seriesCount: number;
  remainder: number;
  loop: number;
  list: SeriesEntry[];
};

export function SeriesClient() {
  const { profile, tt, ui } = useApp();
  const router = useRouter();
  const [lang, setLang] = useState<string>(profile?.learningLang ?? "en");
  const [data, setData] = useState<SeriesData | null>(null);

  useEffect(() => {
    if (!profile) return;
    let live = true;
    fetch(`/api/series?profileId=${profile.id}&language=${lang}`)
      .then((r) => r.json())
      .then((d: SeriesData) => {
        if (live) setData(d);
      });
    return () => {
      live = false;
    };
  }, [profile, lang]);

  const start = (s: SeriesEntry) => {
    const q = new URLSearchParams({
      lang,
      level: "all",
      category: "all",
      mode: "series",
      seriesId: s.id,
      seriesWaves: String(s.waves),
    });
    router.push(`/play?${q.toString()}`);
  };

  return (
    <AppFrame title={tt("series")}>
      <div className="mb-3 flex flex-wrap gap-2">
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            className={`rounded-full border px-3 py-1 text-xs ${
              lang === l.code ? "border-cyan-300 bg-cyan-300/15" : "border-white/10"
            }`}
          >
            {l.flag} {l.code.toUpperCase()}
          </button>
        ))}
      </div>

      {data && (
        <div className="holo-strong mb-4 rounded-2xl p-4 text-center">
          <p className="font-digital text-lg tracking-[0.14em] text-cyan-100">
            {data.total} ÷ {data.size} = {data.seriesCount} {tt("seri")}
          </p>
          <p className="mt-1 text-xs text-white/50">
            {data.remainder} {tt("artan")} · {tt("loop")} {data.loop}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-white/40">
            {ui === "en"
              ? "Every series plays 150 words (15 waves). After the last series the loop restarts from #1."
              : "Her seri 150 kelime oynatır (15 dalga). Son seride döngü 1 numaraya baştan başlar."}
          </p>
        </div>
      )}

      <div className="grid gap-2">
        {data?.list.map((s) => (
          <div
            key={s.id}
            className={`holo flex items-center gap-3 rounded-2xl p-3 ${s.unlocked ? "" : "opacity-45"}`}
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-300/10 font-display text-sm text-cyan-200">
              {s.number}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-cyan-50">
                {tt("seri")} #{s.number}
                <span className="ml-2 text-[11px] text-white/40">
                  {s.from}–{s.to} {tt("wordsRange")}
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-amber-300">
                {"★".repeat(s.stars)}
                {"☆".repeat(Math.max(0, 3 - s.stars))}
                {s.bestScore > 0 && (
                  <span className="ml-2 font-digital text-cyan-100/70">{padScore(s.bestScore)}</span>
                )}
              </p>
            </div>
            {s.unlocked ? (
              <button type="button" className="holo-strong rounded-xl px-3 py-2 text-xs tracking-widest" onClick={() => start(s)}>
                {tt("start")}
              </button>
            ) : (
              <span className="text-[10px] tracking-[0.2em] text-white/40">{tt("locked")}</span>
            )}
          </div>
        ))}
      </div>
    </AppFrame>
  );
}
