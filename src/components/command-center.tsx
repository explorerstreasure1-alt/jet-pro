"use client";

import { CATEGORIES, LANGS, LEVELS, padScore } from "@/lib/constants";
import { resumeAudio, sfxUi, startMusic } from "@/lib/audio";
import { primeSpeech } from "@/lib/speech";
import type { Category, LangCode, Level } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Starfield } from "./starfield";
import { useApp } from "./providers";
import { InstallButton } from "./install-button";
import { AlienSprite, ShipSprite } from "./sprites";

export function CommandCenter() {
  const { profile, tt, ui, patch } = useApp();
  const router = useRouter();
  const [lobby, setLobby] = useState(false);

  const settingsRef = useRef(profile?.settings);
  useEffect(() => {
    settingsRef.current = profile?.settings;
  }, [profile]);
  useEffect(() => {
    // Browser autoplay policy: start the ambient track on the first touch.
    const onFirst = () => {
      void resumeAudio();
      primeSpeech();
      if (settingsRef.current?.music !== false) startMusic("menu");
    };
    window.addEventListener("pointerdown", onFirst, { once: true });
    return () => window.removeEventListener("pointerdown", onFirst);
  }, []);
  const [lang, setLang] = useState<LangCode>((profile?.learningLang as LangCode) || "en");
  const [level, setLevel] = useState<Level>((profile?.cefrLevel as Level) || "A1");
  const [cat, setCat] = useState<Category>((profile?.category as Category) || "all");

  const modules = useMemo(
    () =>
      [
        { href: "/daily", key: "daily" as const, blurb: ui === "en" ? "20 words · chest" : "20 kelime · sandık" },
        { href: "/series", key: "series" as const, blurb: ui === "en" ? "Structured raids" : "Yapılandırılmış akın" },
        { href: "/lexicon", key: "lexicon" as const, blurb: ui === "en" ? "Heat map & custom" : "Isı haritası & özel" },
        { href: "/shop", key: "shop" as const, blurb: ui === "en" ? "Rays, hints, hulls" : "Işın, ipucu, gövde" },
        { href: "/stats", key: "stats" as const, blurb: ui === "en" ? "Combat log" : "Savaş kaydı" },
        { href: "/settings", key: "settings" as const, blurb: ui === "en" ? "Access & voice" : "Erişim & ses" },
      ],
    [ui],
  );

  const launch = async () => {
    sfxUi();
    primeSpeech();
    await resumeAudio();
    await patch({ learningLang: lang, cefrLevel: level, category: cat });
    const qs = new URLSearchParams({ lang, level, category: cat, mode: "arcade" });
    router.push(`/play?${qs.toString()}`);
  };

  const daily = profile?.daily;
  const dailyPct = daily
    ? Math.min(100, Math.round((daily.wordsCompleted / Math.max(1, daily.targetWords)) * 100))
    : 0;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(20, 80, 90, 0.28), transparent 58%)" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,18,0.55),rgba(4,8,18,0.88))]" />
      <Starfield />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-5 sm:px-8">
        <header className="flex flex-wrap items-center gap-2">
          <div className="holo flex min-w-0 items-center gap-2 rounded-2xl px-3 py-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10">
              <AlienSprite className="h-6 w-8" />
            </div>
            <div>
              <p className="text-[9px] tracking-[0.28em] text-white/40">{tt("callsign")}</p>
              <p className="font-display text-sm tracking-[0.16em] text-cyan-100">{profile?.callsign ?? "—"}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <InstallButton />
            <StatChip label={tt("credits")} value={String(profile?.credits ?? 0)} gold />
            <StatChip label={tt("streak")} value={`${profile?.streak ?? 0}d`} />
            <StatChip label={tt("highScore")} value={padScore(profile?.highScore ?? 0)} />
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <p className="font-display text-[10px] tracking-[0.5em] text-cyan-200/70">{tt("tagline")}</p>
          <h1 className="font-display glow-cyan mt-3 text-4xl font-extrabold tracking-[0.22em] text-[#8ffff0] sm:text-6xl">
            WORD INVADERS
          </h1>
          <p className="mt-3 max-w-lg text-sm text-cyan-100/70">{tt("defenseLine")} · {tt("neural")}</p>
          <p className="font-digital mt-3 text-xs tracking-[0.28em] text-cyan-200/60">
            7 LANGUAGES · 52.500 WORDS · A1–C1
          </p>

          <div className="mt-8 flex items-end gap-6">
            <AlienSprite className="h-10 w-14 opacity-70" tint="#5ee0c0" />
            <ShipSprite className="h-20 w-20" variant={profile?.equippedShip ?? "viper"} />
            <AlienSprite className="h-10 w-14 opacity-70" tint="#5ee0c0" />
          </div>

          <button
            type="button"
            onClick={() => {
              sfxUi();
              primeSpeech();
              setLobby(true);
            }}
            className="holo-strong mt-8 rounded-2xl px-12 py-4 font-display text-xl tracking-[0.35em] text-cyan-50"
          >
            {tt("play")}
          </button>
          <p className="mt-3 text-[11px] tracking-[0.2em] text-white/40">
            {lang.toUpperCase()} · {level} · {cat === "all" ? tt("allCats") : cat}
          </p>
        </main>

        {daily && (
          <Link href="/daily" className="holo mb-5 flex items-center gap-4 rounded-2xl p-4">
            <div className="flex-1 text-left">
              <p className="font-display text-[10px] tracking-[0.3em] text-cyan-200/70">{tt("dailyTitle")}</p>
              <p className="mt-1 text-sm text-white/80">
                {daily.wordsCompleted}/{daily.targetWords} {tt("words")}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-cyan-300" style={{ width: `${dailyPct}%` }} />
              </div>
            </div>
            <span className="font-display text-[10px] tracking-[0.2em] text-cyan-200">{tt("continue")} →</span>
          </Link>
        )}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {modules.map((m) => (
            <Link key={m.href} href={m.href} className="holo rounded-2xl p-4 text-left transition hover:border-cyan-300/60">
              <p className="font-display text-sm tracking-[0.22em] text-cyan-100">{tt(m.key)}</p>
              <p className="mt-1 text-xs text-white/45">{m.blurb}</p>
            </Link>
          ))}
        </section>
      </div>

      {lobby && (
        <div className="fixed inset-0 z-40 grid place-items-end bg-black/70 p-3 sm:place-items-center">
          <div className="holo max-h-[92dvh] w-full max-w-lg overflow-auto rounded-3xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display tracking-[0.22em] text-cyan-100">{tt("startMission")}</h2>
              <button type="button" className="text-white/50" onClick={() => setLobby(false)}>
                ✕
              </button>
            </div>
            <p className="mb-2 text-[10px] tracking-[0.28em] text-white/40">{tt("chooseLang")}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={`rounded-xl border px-2 py-2 text-sm ${
                    lang === l.code ? "border-cyan-300 bg-cyan-300/15" : "border-white/10 bg-black/30"
                  }`}
                >
                  <span className="mr-1">{l.flag}</span>
                  {ui === "en" ? l.nameEn : l.nameTr}
                </button>
              ))}
            </div>
            <p className="mb-2 mt-5 text-[10px] tracking-[0.28em] text-white/40">{tt("chooseLevel")}</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLevel(l.code)}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    level === l.code ? "border-cyan-300 bg-cyan-300/15" : "border-white/10 bg-black/30"
                  }`}
                >
                  <span className="font-display tracking-widest">{l.code}</span>
                  <span className="ml-2 text-white/50">{ui === "en" ? l.nameEn : l.nameTr}</span>
                </button>
              ))}
            </div>
            <p className="mb-2 mt-5 text-[10px] tracking-[0.28em] text-white/40">{tt("chooseCat")}</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCat(c.code)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    cat === c.code ? "border-cyan-300 bg-cyan-300/15" : "border-white/10 bg-black/30"
                  }`}
                >
                  {ui === "en" ? c.nameEn : c.nameTr}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void launch()}
              className="holo-strong mt-6 w-full rounded-2xl py-4 font-display tracking-[0.32em] text-cyan-50"
            >
              {tt("startMission")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatChip({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="holo rounded-xl px-2 py-1.5">
      <p className="text-[8px] tracking-[0.18em] text-white/40">{label}</p>
      <p className={`font-digital text-xs sm:text-sm ${gold ? "text-amber-300" : "text-cyan-100"}`}>{value}</p>
    </div>
  );
}


