"use client";

import { CATEGORIES, LANGS, LEVELS, heatBand } from "@/lib/constants";
import { addCustomWord, fetchWords } from "@/lib/data";
import { speakTerm } from "@/lib/speech";
import type { LangCode, WordCard } from "@/lib/types";
import { useEffect, useState } from "react";
import { AppFrame } from "./app-frame";
import { useApp } from "./providers";

export function LexiconClient() {
  const { profile, tt, ui } = useApp();
  const [lang, setLang] = useState<LangCode>((profile?.learningLang as LangCode) || "en");
  const [level, setLevel] = useState<string>("all");
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [words, setWords] = useState<WordCard[]>([]);
  const [visibleCount, setVisibleCount] = useState(60);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ term: "", translationTr: "", translationEn: "", level: "A1", category: "daily" });

  const load = () => {
    setVisibleCount(60);
    fetchWords({
      language: lang,
      level,
      category: cat,
      q,
      profileId: profile ? String(profile.id) : undefined,
    }).then(setWords);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, level, cat, profile?.id]);

  const add = async () => {
    await addCustomWord({ language: lang, ...form });
    setOpen(false);
    setForm({ term: "", translationTr: "", translationEn: "", level: "A1", category: "daily" });
    load();
  };

  const ice = words.filter((w) => heatBand(w.heat) === "ice").length;
  const warm = words.filter((w) => heatBand(w.heat) === "warm").length;
  const fire = words.filter((w) => heatBand(w.heat) === "fire").length;

  return (
    <AppFrame title={tt("lexicon")}>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <HeatStat label={tt("ice")} n={ice} color="text-cyan-200" />
        <HeatStat label={tt("warm")} n={warm} color="text-amber-200" />
        <HeatStat label={tt("fireHeat")} n={fire} color="text-fuchsia-300" />
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            className={`rounded-full border px-3 py-1 text-xs ${lang === l.code ? "border-cyan-300 bg-cyan-300/15" : "border-white/10"}`}
          >
            {l.flag} {l.code.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="mb-3 flex gap-2">
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="flex-1 px-3 py-2 text-sm">
          <option value="all">CEFR</option>
          {LEVELS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.code}
            </option>
          ))}
        </select>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="flex-1 px-3 py-2 text-sm">
          {CATEGORIES.map((c) => (
            <option key={c.code} value={c.code}>
              {ui === "en" ? c.nameEn : c.nameTr}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder={tt("search")}
          className="flex-1 px-3 py-2 text-sm"
        />
        <button type="button" className="holo rounded-xl px-3" onClick={load}>
          ↵
        </button>
        <button type="button" className="holo-strong rounded-xl px-3 text-xs" onClick={() => setOpen(true)}>
          {tt("addWord")}
        </button>
      </div>
      <div className="mb-2 flex items-center justify-between text-[11px] text-white/45">
        <span>
          {ui === "en" ? "Total filtered:" : "Filtrelenen:"} <strong className="text-cyan-200 font-digital">{words.length}</strong> {tt("words")}
        </span>
        <span>
          {ui === "en" ? "Showing:" : "Gösterilen:"} <strong className="text-cyan-200 font-digital">{Math.min(visibleCount, words.length)}</strong>
        </span>
      </div>
      <ul className="space-y-2">
        {words.slice(0, visibleCount).map((w) => {
          const band = heatBand(w.heat);
          return (
            <li key={w.id} className="holo flex items-center gap-3 rounded-2xl px-3 py-3">
              <div
                className={`h-2 w-2 rounded-full shrink-0 ${
                  band === "fire" ? "bg-fuchsia-400" : band === "warm" ? "bg-amber-300" : "bg-cyan-300"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-cyan-50">{w.term}</p>
                <p className="truncate text-xs text-white/45">
                  {w.translationTr} · {w.translationEn} · {w.level} · {w.category}
                  {w.isCustom ? ` · ${tt("custom")}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="text-xs tracking-widest text-cyan-200 shrink-0"
                onClick={() => speakTerm(w.term, lang, profile?.settings.voiceRate ?? 0.92)}
              >
                {tt("listen")}
              </button>
            </li>
          );
        })}
      </ul>
      {visibleCount < words.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((n) => n + 60)}
          className="holo mt-3 w-full rounded-2xl py-3 text-xs tracking-[0.2em] text-cyan-100 hover:border-cyan-300/60"
        >
          {ui === "en" ? `+ SHOW MORE (${Math.min(visibleCount, words.length)} / ${words.length})` : `+ DAHA FAZLA GÖSTER (${Math.min(visibleCount, words.length)} / ${words.length})`}
        </button>
      )}
      {!words.length && <p className="mt-8 text-center text-white/40">{tt("emptyLexicon")}</p>}

      {open && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4">
          <div className="holo w-full max-w-md rounded-2xl p-5">
            <h3 className="font-display tracking-[0.2em]">{tt("addWord")}</h3>
            <input
              className="mt-3 w-full px-3 py-2"
              placeholder={tt("term")}
              value={form.term}
              onChange={(e) => setForm({ ...form, term: e.target.value })}
            />
            <input
              className="mt-2 w-full px-3 py-2"
              placeholder={tt("meaningTr")}
              value={form.translationTr}
              onChange={(e) => setForm({ ...form, translationTr: e.target.value })}
            />
            <input
              className="mt-2 w-full px-3 py-2"
              placeholder={tt("meaningEn")}
              value={form.translationEn}
              onChange={(e) => setForm({ ...form, translationEn: e.target.value })}
            />
            <div className="mt-2 flex gap-2">
              <select
                className="flex-1 px-3 py-2"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              >
                {LEVELS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.code}
                  </option>
                ))}
              </select>
              <select
                className="flex-1 px-3 py-2"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.filter((c) => c.code !== "all").map((c) => (
                  <option key={c.code} value={c.code}>
                    {ui === "en" ? c.nameEn : c.nameTr}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="flex-1 py-2 text-white/50" onClick={() => setOpen(false)}>
                ✕
              </button>
              <button type="button" className="holo-strong flex-1 rounded-xl py-2" onClick={() => void add()}>
                {tt("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppFrame>
  );
}

function HeatStat({ label, n, color }: { label: string; n: number; color: string }) {
  return (
    <div className="holo rounded-xl p-3 text-center">
      <p className={`font-digital text-xl ${color}`}>{n}</p>
      <p className="text-[10px] tracking-[0.2em] text-white/40">{label}</p>
    </div>
  );
}


