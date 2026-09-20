"use client";

import { SHOP_ITEMS } from "@/lib/constants";
import { shopBuy } from "@/lib/data";
import { useState } from "react";
import { AppFrame } from "./app-frame";
import { useApp } from "./providers";

export function ShopClient() {
  const { profile, tt, ui, reload } = useApp();
  const [msg, setMsg] = useState("");

  const qty = (code: string) => profile?.inventory.find((i) => i.itemCode === code)?.qty ?? 0;

  const buy = async (code: string) => {
    if (!profile) return;
    try {
      await shopBuy(profile.id, code, false);
      setMsg("");
      await reload();
    } catch {
      setMsg(tt("notEnough"));
    }
  };

  const equip = async (code: string) => {
    if (!profile) return;
    try {
      await shopBuy(profile.id, code, true);
      await reload();
    } catch {
      setMsg(tt("notEnough"));
    }
  };

  return (
    <AppFrame title={tt("shop")}>
      {msg && <p className="mb-3 text-center text-sm text-amber-300">{msg}</p>}
      <div className="grid gap-3">
        {SHOP_ITEMS.map((item) => {
          const owned = qty(item.code);
          const cosmetic = "cosmetic" in item && item.cosmetic;
          const shipName = item.code.replace("ship_", "");
          const equipped = profile?.equippedShip === shipName;
          return (
            <div key={item.code} className="holo flex items-center gap-3 rounded-2xl p-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-300/10 text-xl">{item.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="font-display tracking-[0.14em] text-cyan-100">{ui === "en" ? item.nameEn : item.nameTr}</p>
                <p className="text-xs text-white/50">{ui === "en" ? item.descEn : item.descTr}</p>
                <p className="mt-1 font-digital text-amber-300">{item.price} CR</p>
              </div>
              <div className="flex flex-col gap-2">
                {cosmetic && owned > 0 ? (
                  <button
                    type="button"
                    className="holo-strong rounded-xl px-3 py-2 text-xs"
                    onClick={() => void equip(item.code)}
                  >
                    {equipped ? tt("equipped") : tt("equip")}
                  </button>
                ) : (
                  <button type="button" className="holo-strong rounded-xl px-3 py-2 text-xs" onClick={() => void buy(item.code)}>
                    {tt("buy")}
                  </button>
                )}
                {owned > 0 && <p className="text-center text-[10px] text-white/40">×{owned}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </AppFrame>
  );
}
