"use client";

import { useEffect, useState } from "react";
import { useApp } from "./providers";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iPadOs = /Macintosh/.test(ua) && "ontouchend" in document;
  return /iPhone|iPad|iPod/.test(ua) || iPadOs;
}

export function InstallButton({ compact = false }: { compact?: boolean }) {
  const { tt } = useApp();
  const [mode, setMode] = useState<"hidden" | "native" | "ios" | "done">("hidden");
  const [iosOpen, setIosOpen] = useState(false);

  useEffect(() => {
    const decide = () => {
      if (isStandalone()) {
        setMode("done");
        return;
      }
      const w = window as Window & { __wiPrompt?: PromptEvent };
      if (w.__wiPrompt) setMode("native");
      else if (isIos()) setMode("ios");
      else setMode("hidden");
    };
    const t = window.setTimeout(decide, 0);
    const onCan = () => setMode(isStandalone() ? "done" : "native");
    const onInstalled = () => setMode("done");
    window.addEventListener("wi-can-install", onCan);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("wi-can-install", onCan);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    const w = window as Window & { __wiPrompt?: PromptEvent };
    const deferred = w.__wiPrompt;
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice.catch(() => ({ outcome: "dismissed" as const }));
    if (choice.outcome === "accepted") {
      w.__wiPrompt = undefined;
      setMode("done");
    }
  };

  if (mode === "hidden") return null;

  const label = mode === "done" ? tt("installed") : tt("installApp");

  return (
    <>
      <button
        type="button"
        disabled={mode === "done"}
        onClick={() => {
          if (mode === "native") void install();
          else if (mode === "ios") setIosOpen(true);
        }}
        className={
          compact
            ? "holo flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] tracking-[0.2em] text-cyan-100 disabled:opacity-50"
            : "holo-strong mx-auto mt-3 flex items-center gap-2 rounded-2xl px-6 py-3 font-display text-xs tracking-[0.28em] text-cyan-50 disabled:opacity-60"
        }
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3v12M7 10l5 5 5-5" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        {label}
      </button>
      {!compact && mode !== "done" && (
        <p className="mt-1 text-center text-[10px] tracking-[0.14em] text-white/35">{tt("installHint")}</p>
      )}

      {iosOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-5" onClick={() => setIosOpen(false)}>
          <div className="holo w-full max-w-sm rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-center tracking-[0.2em] text-cyan-100">{tt("iosInstallTitle")}</h3>
            <ol className="mt-4 space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan-300/40 font-digital text-cyan-200">1</span>
                {tt("iosStep1")}
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 15V4M8 7l4-4 4 4" />
                  <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
                </svg>
              </li>
              <li className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan-300/40 font-digital text-cyan-200">2</span>
                {tt("iosStep2")}
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="4" width="16" height="16" rx="4" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </li>
              <li className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan-300/40 font-digital text-cyan-200">3</span>
                {tt("iosStep3")}
              </li>
            </ol>
            <button type="button" className="holo-strong mt-5 w-full rounded-xl py-3" onClick={() => setIosOpen(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
