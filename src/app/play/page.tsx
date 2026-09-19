import { PlayClient } from "@/components/play-client";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center bg-[#050814] text-cyan-200">
          <p className="font-display tracking-[0.3em]">LOADING</p>
        </div>
      }
    >
      <PlayClient />
    </Suspense>
  );
}
