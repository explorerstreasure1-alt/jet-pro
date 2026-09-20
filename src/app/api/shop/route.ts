import { db } from "@/db";
import { achievements, inventory, profiles } from "@/db/schema";
import { SHOP_ITEMS } from "@/lib/constants";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { profileId?: number; itemCode?: string; equip?: boolean };
    if (!body.profileId || !body.itemCode) {
      return Response.json({ error: "missing" }, { status: 400 });
    }

    const [p] = await db.select().from(profiles).where(eq(profiles.id, body.profileId));
    if (!p) return Response.json({ error: "profile" }, { status: 404 });

    if (body.equip) {
      const owned = await db
        .select()
        .from(inventory)
        .where(and(eq(inventory.profileId, p.id), eq(inventory.itemCode, body.itemCode)));
      if (!owned[0] && body.itemCode !== "viper") {
        return Response.json({ error: "not owned" }, { status: 400 });
      }
      const ship = body.itemCode.replace("ship_", "");
      const [updated] = await db
        .update(profiles)
        .set({ equippedShip: ship, updatedAt: new Date() })
        .where(eq(profiles.id, p.id))
        .returning();
      return Response.json({ profile: updated });
    }

    const item = SHOP_ITEMS.find((i) => i.code === body.itemCode);
    if (!item) return Response.json({ error: "item" }, { status: 404 });
    if (p.credits < item.price) return Response.json({ error: "credits" }, { status: 400 });

    const existing = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.profileId, p.id), eq(inventory.itemCode, item.code)));

    if ("cosmetic" in item && item.cosmetic && existing[0]) {
      return Response.json({ error: "owned" }, { status: 400 });
    }

    const [updated] = await db
      .update(profiles)
      .set({ credits: p.credits - item.price, updatedAt: new Date() })
      .where(eq(profiles.id, p.id))
      .returning();

    if (existing[0]) {
      await db
        .update(inventory)
        .set({ qty: existing[0].qty + item.qty })
        .where(eq(inventory.id, existing[0].id));
    } else {
      await db.insert(inventory).values({
        profileId: p.id,
        itemCode: item.code,
        qty: item.qty,
      });
    }

    await db.insert(achievements).values({ profileId: p.id, code: "shopper" }).onConflictDoNothing();

    const inv = await db.select().from(inventory).where(eq(inventory.profileId, p.id));
    return Response.json({ profile: updated, inventory: inv });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "shop failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { profileId?: number; itemCode?: string; delta?: number };
    if (!body.profileId || !body.itemCode) {
      return Response.json({ error: "missing" }, { status: 400 });
    }
    const delta = body.delta ?? -1;
    const rows = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.profileId, body.profileId), eq(inventory.itemCode, body.itemCode)));
    const cur = rows[0];
    if (!cur || cur.qty + delta < 0) return Response.json({ error: "qty" }, { status: 400 });
    const [updated] = await db
      .update(inventory)
      .set({ qty: cur.qty + delta })
      .where(eq(inventory.id, cur.id))
      .returning();
    return Response.json(updated);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "consume failed" }, { status: 500 });
  }
}
