"use client";

import { t, type I18nKey } from "@/lib/i18n";
import type { UiLang } from "@/lib/types";
import { setMusic, setSfx } from "@/lib/audio";
import {
  defaultSettings,
  fetchProfile,
  getClientId,
  patchProfile,
  probeDb,
} from "@/lib/data";
import type { ProfileSettings } from "@/db/schema";
import type { ClientProfile } from "@/lib/profile-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Ctx = {
  profile: ClientProfile | null;
  ready: boolean;
  ui: UiLang;
  tt: (key: I18nKey) => string;
  reload: () => Promise<void>;
  patch: (body: Record<string, unknown>) => Promise<void>;
  setProfile: (p: ClientProfile | null) => void;
  installEvent: BeforeInstallPromptEvent | null;
  installable: boolean;
  isIos: boolean;
  installed: boolean;
};

const C = createContext<Ctx | null>(null);

export { getClientId };

function applyDom(s: ProfileSettings) {
  const el = document.documentElement;
  el.dataset.eye = s.eyeProtect ? "on" : "off";
  el.dataset.contrast = s.highContrast ? "on" : "off";
  el.dataset.motion = s.reducedMotion ? "on" : "off";
  el.dataset.dyslexia = s.dyslexiaFont ? "on" : "off";
  el.style.setProperty("--font-scale", String(s.fontScale || 1));
  setSfx(s.sfx);
  setMusic(s.music);
}

function detectIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function Providers({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [boot, setBoot] = useState(true);
  const [bootPct, setBootPct] = useState(8);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  const reload = useCallback(async () => {
    const data = await fetchProfile();
    setProfile(data);
    applyDom({ ...defaultSettings, ...data.settings });
  }, []);

  const patch = useCallback(
    async (body: Record<string, unknown>) => {
      const updated = await patchProfile(body);
      setProfile(updated);
      applyDom({ ...defaultSettings, ...updated.settings });
    },
    [],
  );

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    const media = window.matchMedia("(display-mode: standalone)");
    const installTimer = window.setTimeout(() => setInstalled(media.matches), 0);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((reg) => {
          reg.update().catch(() => undefined);
          reg.active?.postMessage("purge");
        })
        .catch(() => undefined);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(installTimer);
    };
  }, []);

  useEffect(() => {
    let live = true;
    let doneTimer = 0;
    const seen = sessionStorage.getItem("wi_boot");
    const tick = window.setInterval(() => {
      setBootPct((n) => Math.min(96, n + Math.random() * 14));
    }, 180);

    const start = window.setTimeout(() => {
      probeDb()
        .catch(() => undefined)
        .finally(() =>
          reload()
            .catch(() => undefined)
            .finally(() => {
              if (!live) return;
              setReady(true);
              const wait = seen ? 200 : 1400;
              doneTimer = window.setTimeout(() => {
                sessionStorage.setItem("wi_boot", "1");
                setBootPct(100);
                setBoot(false);
              }, wait);
              window.clearInterval(tick);
            }),
        );
    }, 0);

    return () => {
      live = false;
      window.clearTimeout(start);
      window.clearTimeout(doneTimer);
      window.clearInterval(tick);
    };
  }, [reload]);

  const ui: UiLang = profile?.settings?.uiLang === "en" ? "en" : "tr";
  const tt = useCallback((key: I18nKey) => t(ui, key), [ui]);

  const value = useMemo<Ctx>(
    () => ({
      profile,
      ready,
      ui,
      tt,
      reload,
      patch,
      setProfile,
      installEvent,
      installable: Boolean(installEvent),
      isIos: detectIos(),
      installed,
    }),
    [profile, ready, ui, tt, reload, patch, installEvent, installed],
  );

  return (
    <C.Provider value={value}>
      {boot ? <BootScreen pct={bootPct} /> : children}
    </C.Provider>
  );
}

function BootScreen({ pct }: { pct: number }) {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#050814] px-6">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(20, 80, 90, 0.28), transparent 58%)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent,rgba(0,0,0,0.75))]" />
      <div className="relative z-10 w-full max-w-md text-center">
        <p className="font-display text-[10px] tracking-[0.45em] text-cyan-200/70">
          HOLOGRAPHIC SUBCONSCIOUS PROTOCOL
        </p>
        <h1 className="font-display glow-cyan mt-4 text-3xl font-bold tracking-[0.28em] text-[#7dfff0] sm:text-4xl">
          WORD INVADERS
        </h1>
        <p className="mt-6 text-xs tracking-[0.28em] text-[#9adfd0]">NÖRAL BAĞLANTI KURULUYOR</p>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-6 space-y-1 font-display text-[10px] tracking-[0.32em] text-white/45">
          <p>SÖZLÜK ÇEKİRDEĞİ · ONLINE</p>
          <p>SES KANALI · STANDBY</p>
          <p>SAVUNMA HATTI · ARMING</p>
        </div>
      </div>
    </div>
  );
}

export function useApp() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useApp");
  return ctx;
}
