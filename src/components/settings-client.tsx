"use client";

import { setMusic } from "@/lib/audio";
import { LANGS } from "@/lib/constants";
import type { ProfileSettings } from "@/db/schema";
import { useEffect, useState, type ReactNode } from "react";
import { AppFrame } from "./app-frame";
import { useApp, getClientId } from "./providers";

export function SettingsClient() {
  const { profile, tt, patch, reload } = useApp();
  const s = profile?.settings;
  const [callsign, setCallsign] = useState(profile?.callsign ?? "");
  const [cid, setCid] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setCid(getClientId().slice(0, 8)), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!profile || !s) return null;

  const setSetting = async (partial: Partial<ProfileSettings>) => {
    await patch({ settings: { ...s, ...partial } });
  };

  const resetHeat = async () => {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: profile.id, reset: true }),
    });
    await reload();
  };

  const install = async () => {
    const deferred = (window as Window & { __wiPrompt?: { prompt: () => Promise<void> } }).__wiPrompt;
    if (deferred) await deferred.prompt();
  };

  return (
    <AppFrame title={tt("settings")}>
      <div className="space-y-4">
        <Field label={tt("callsign")}>
          <div className="flex gap-2">
            <input className="flex-1 px-3 py-2" value={callsign} onChange={(e) => setCallsign(e.target.value)} />
            <button type="button" className="holo rounded-xl px-3" onClick={() => void patch({ callsign })}>
              {tt("save")}
            </button>
          </div>
        </Field>
        <Field label={tt("uiLang")}>
          <div className="flex gap-2">
            <Chip on={s.uiLang === "tr"} onClick={() => void setSetting({ uiLang: "tr" })}>
              {tt("turkish")}
            </Chip>
            <Chip on={s.uiLang === "en"} onClick={() => void setSetting({ uiLang: "en" })}>
              {tt("english")}
            </Chip>
          </div>
        </Field>
        <Field label={tt("native")}>
          <div className="flex gap-2">
            <Chip on={profile.nativeLang === "tr"} onClick={() => void patch({ nativeLang: "tr" })}>
              TR
            </Chip>
            <Chip on={profile.nativeLang === "en"} onClick={() => void patch({ nativeLang: "en" })}>
              EN
            </Chip>
          </div>
        </Field>
        <Field label={tt("chooseLang")}>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <Chip
                key={l.code}
                on={profile.learningLang === l.code}
                onClick={() => void patch({ learningLang: l.code })}
              >
                {l.flag} {l.code.toUpperCase()}
              </Chip>
            ))}
          </div>
        </Field>
        <Field label={tt("fontSize")}>
          <input
            type="range"
            min={0.85}
            max={1.3}
            step={0.05}
            value={s.fontScale}
            onChange={(e) => void setSetting({ fontScale: Number(e.target.value) })}
            className="w-full"
          />
        </Field>
        <Field label={tt("voiceRate")}>
          <input
            type="range"
            min={0.7}
            max={1.15}
            step={0.01}
            value={s.voiceRate}
            onChange={(e) => void setSetting({ voiceRate: Number(e.target.value) })}
            className="w-full"
          />
        </Field>
        <Toggle label={tt("highContrast")} on={s.highContrast} onChange={(v) => void setSetting({ highContrast: v })} />
        <Toggle label={tt("eyeProtect")} on={s.eyeProtect} onChange={(v) => void setSetting({ eyeProtect: v })} />
        <Toggle label={tt("reducedMotion")} on={s.reducedMotion} onChange={(v) => void setSetting({ reducedMotion: v })} />
        <Toggle label={tt("dyslexia")} on={s.dyslexiaFont} onChange={(v) => void setSetting({ dyslexiaFont: v })} />
        <Toggle label={tt("sfx")} on={s.sfx} onChange={(v) => void setSetting({ sfx: v })} />
        <Toggle
          label={tt("music")}
          on={s.music}
          onChange={(v) => {
            setMusic(v);
            void setSetting({ music: v });
          }}
        />
        <Toggle label={tt("autoSpeak")} on={s.autoSpeak} onChange={(v) => void setSetting({ autoSpeak: v })} />
        <Toggle label={tt("mic")} on={s.asr} onChange={(v) => void setSetting({ asr: v })} />
        <Field label={tt("speakIn")}>
          <div className="flex gap-2">
            <Chip on={(s.speakIn ?? "target") === "target"} onClick={() => void setSetting({ speakIn: "target" })}>
              {tt("targetVoice")}
            </Chip>
            <Chip on={(s.speakIn ?? "target") === "native"} onClick={() => void setSetting({ speakIn: "native" })}>
              {tt("nativeVoice")}
            </Chip>
          </div>
        </Field>
        <button type="button" className="holo w-full rounded-2xl py-3" onClick={() => void resetHeat()}>
          {tt("resetHeat")}
        </button>
        <button type="button" className="holo w-full rounded-2xl py-3" onClick={() => void install()}>
          {tt("install")}
        </button>
        <p className="text-center text-[10px] text-white/30">{cid}</p>
      </div>
    </AppFrame>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="holo rounded-2xl p-4">
      <p className="mb-2 text-[10px] tracking-[0.22em] text-white/40">{label}</p>
      {children}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-cyan-300 bg-cyan-300/15" : "border-white/10"}`}
    >
      {children}
    </button>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="holo flex w-full items-center justify-between rounded-2xl px-4 py-3">
      <span>{label}</span>
      <span className={`font-display text-xs tracking-widest ${on ? "text-cyan-300" : "text-white/30"}`}>{on ? "ON" : "OFF"}</span>
    </button>
  );
}
