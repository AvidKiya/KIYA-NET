export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { gameScores, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from "nanoid";

const MAX_SCORES: Record<string, number> = {
  memory: 1000,
  reaction: 500,
  quiz: 1000,
  puzzle: 1000,
};

const MAX_POINTS_PER_DAY = 5000;

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

    const { gameType, score, points, metadata } = await req.json();

    if (!gameType || !["memory", "reaction", "quiz", "puzzle"].includes(gameType)) {
      return NextResponse.json({ error: "نوع بازی نامعتبر" }, { status: 400 });
    }

    const numericScore = Number(score);
    const numericPoints = Number(points);

    if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > (MAX_SCORES[gameType] || 1000)) {
      return NextResponse.json({ error: "امتیاز نامعتبر" }, { status: 400 });
    }

    if (!Number.isFinite(numericPoints) || numericPoints < 0 || numericPoints > 1000) {
      return NextResponse.json({ error: "امتیاز کسب‌شده نامعتبر" }, { status: 400 });
    }

    // Anti-cheat: check daily points limit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayScores = await db
      .select({ total: sql<number>`COALESCE(SUM(${gameScores.points}), 0)` })
      .from(gameScores)
      .where(eq(gameScores.userId, session.userId))
      .then((r) => r[0]?.total || 0);

    if (todayScores + numericPoints > MAX_POINTS_PER_DAY) {
      return NextResponse.json({ error: "محدودیت امتیاز روزانه تکمیل شده" }, { status: 400 });
    }

    await db.insert(gameScores).values({
      id: nanoid(),
      userId: session.userId,
      gameType,
      score: numericScore,
      points: numericPoints,
      metadata: metadata || {},
    });

    return NextResponse.json({ success: true, todayPoints: todayScores + numericPoints });
  } catch (error) {
    console.error("Game score error:", error);
    return NextResponse.json({ error: "خطا در ثبت امتیاز" }, { status: 500 });
  }
}
