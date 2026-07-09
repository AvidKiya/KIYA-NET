export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { gameScores, coupons, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from "nanoid";

const TIERS = [
  { points: 1000, discountPercent: 5, maxUses: 1 },
  { points: 2500, discountPercent: 10, maxUses: 1 },
  { points: 5000, discountPercent: 15, maxUses: 1 },
  { points: 10000, discountPercent: 20, maxUses: 1 },
];

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

    const { tierIndex } = await req.json();
    const tier = TIERS[Number(tierIndex)];
    if (!tier) return NextResponse.json({ error: "سطح نامعتبر" }, { status: 400 });

    const totalPoints = await db
      .select({ total: sql<number>`COALESCE(SUM(${gameScores.points}), 0)` })
      .from(gameScores)
      .where(eq(gameScores.userId, session.userId))
      .then((r) => r[0]?.total || 0);

    if (totalPoints < tier.points) {
      return NextResponse.json({ error: "امتیاز کافی نیست" }, { status: 400 });
    }

    const code = "KIYA" + Math.random().toString(36).substring(2, 8).toUpperCase();
    await db.insert(coupons).values({
      id: nanoid(),
      code,
      discountType: "PERCENT",
      discountPercent: tier.discountPercent,
      maxUses: tier.maxUses,
      userId: session.userId,
      source: "GAME",
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      code,
      discountPercent: tier.discountPercent,
      remainingPoints: totalPoints - tier.points,
    });
  } catch (error) {
    console.error("Redeem error:", error);
    return NextResponse.json({ error: "خطا در تبدیل امتیاز" }, { status: 500 });
  }
}
