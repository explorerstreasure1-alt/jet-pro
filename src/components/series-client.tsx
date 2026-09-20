"use client";

import { LANGS, padScore } from "@/lib/constants";
import { fetchSeries, type SeriesEntry, type SeriesData } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppFrame } from "./app-frame";
import { useApp } from "./providers";

export function SeriesClient() {
  const { profile, tt, ui } = useApp();
  const router = useRouter();
  const [lang, setLang] = useState<string>(profile?.learningLang ?? "en");
  const [data, setData] = useState<SeriesData | null>(null);

  useEffect(() => {
    if (!profile) return;
    let live = true;
    fetchSeries(profile.id, lang).then((d) => {
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
          <p className="mt-2 inline-block rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-[11px] tracking-[0.15em] text-cyan-100">
            {ui === "en"
              ? "A1–B1 series are unlocked"
              : "A1–B1 serileri açık"}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-white/40">
            {ui === "en"
              ? "Each series plays 150 words (15 waves). You may start any A1/A2/B1 block; B2 and C1 open as you complete the previous block, then the loop restarts from #1."
              : "Her seri 150 kelime oynatır (15 dalga). İstediğin A1/A2/B1 bloğundan başlayabilirsin; B2 ve C1 önceki blok tamamlanınca açılır, son seride döngü 1 numaraya döner."}
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
                {s.level && (
                  <span className="ml-2 rounded border border-fuchsia-300/30 bg-fuchsia-400/10 px-1.5 py-0.5 text-[9px] tracking-[0.15em] text-fuchsia-200">
                    {s.level}
                  </span>
                )}
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
