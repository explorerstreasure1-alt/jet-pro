"use client";

import { sfxUi } from "@/lib/audio";
import { useState } from "react";
import { useApp } from "./providers";

export function InstallButton({ className = "", block = false }: { className?: string; block?: boolean }) {
  const { installEvent, isIos, installed, tt } = useApp();
  const [open, setOpen] = useState(false);

  if (installed) return null;

  const label = tt("install");

  const onTap = () => {
    sfxUi();
    if (installEvent) {
      void installEvent.prompt();
      void installEvent.userChoice.then(() => setOpen(false));
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onTap}
        className={`${block ? "holo-strong w-full rounded-2xl py-3" : "holo rounded-xl px-3 py-2 text-xs tracking-[0.18em]"} text-cyan-100 ${className}`}
      >
        ⬇ {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4" onClick={() => setOpen(false)}>
          <div
            className="holo w-full max-w-sm rounded-3xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-lg tracking-[0.2em] text-cyan-100">{label}</p>
            {isIos ? (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/70">
                <p>1 · Safari&apos;de alt çubuktaki <b className="text-cyan-200">Paylaş</b> simgesine dokun.</p>
                <div className="text-2xl">
                  <span className="inline-block rounded-lg border border-cyan-300/50 px-3 py-1">
                    {" "}
                    ⎙ Paylaş{" "}
                  </span>
                </div>
                <p>
                  2 · <b className="text-cyan-200">Ana Ekrana Ekle</b> seçeneğini seç.
                </p>
                <p className="text-2xl">＋ Ana Ekran</p>
                <p>3 · Açılan ekranda <b className="text-cyan-200">Ekle</b>&apos;ye dokun. Oyun simgesi telefonuna kurulur.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/70">
                <p>
                  Tarayıcı menüsüne dokun (sağ üstteki <b className="text-cyan-200">⋮</b> üç nokta).
                </p>
                <p>
                  <b className="text-cyan-200">Ana ekrana ekle / Add to Home screen</b> seçeneğine dokun.
                </p>
                <p>Uygulama tam ekran, çevrimdışı çalışacak şekilde kurulur.</p>
              </div>
            )}
            <button
              type="button"
              className="holo-strong mt-5 w-full rounded-xl py-3 text-sm tracking-[0.2em]"
              onClick={() => setOpen(false)}
            >
              TAMAM
            </button>
          </div>
        </div>
      )}
    </>
  );
}
