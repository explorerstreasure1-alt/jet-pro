"use client";

import Link from "next/link";
import { useApp } from "./providers";
import type { ReactNode } from "react";

export function AppFrame({
  title,
  children,
  right,
}: {
  title: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  const { profile } = useApp();
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(20, 80, 90, 0.28), transparent 58%)" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,80,90,0.18),transparent_50%),linear-gradient(180deg,rgba(5,8,20,0.4),rgba(5,8,20,0.88))]" />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col px-4 pb-10 pt-4 sm:px-6">
        <header className="mb-5 flex items-center gap-3">
          <Link
            href="/"
            className="holo grid h-11 w-11 place-items-center rounded-xl text-sm tracking-widest text-cyan-200"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] tracking-[0.35em] text-cyan-200/60">WORD INVADERS</p>
            <h1 className="font-display truncate text-lg tracking-[0.18em] text-cyan-100">{title}</h1>
          </div>
          {right}
          <div className="holo rounded-xl px-3 py-2 text-right">
            <p className="text-[9px] tracking-[0.2em] text-white/40">CR</p>
            <p className="font-digital text-sm text-amber-300">{profile?.credits ?? 0}</p>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
