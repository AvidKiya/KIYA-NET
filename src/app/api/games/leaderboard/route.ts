export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { gameScores, users } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "weekly";
    const me = searchParams.get("me") === "true";

    const now = new Date();
    let startDate = new Date();
    if (period === "daily") startDate.setDate(now.getDate() - 1);
    else if (period === "weekly") startDate.setDate(now.getDate() - 7);
    else if (period === "monthly") startDate.setMonth(now.getMonth() - 1);
    else startDate = new Date(0);

    const rows = await db
      .select({
        userId: gameScores.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        totalPoints: sql<number>`COALESCE(SUM(${gameScores.points}), 0)`,
        totalScore: sql<number>`COALESCE(SUM(${gameScores.score}), 0)`,
      })
      .from(gameScores)
      .leftJoin(users, eq(gameScores.userId, users.id))
      .where(sql`${gameScores.createdAt} >= ${startDate.toISOString()}`)
      .groupBy(gameScores.userId, users.firstName, users.lastName)
      .orderBy(desc(sql`COALESCE(SUM(${gameScores.points}), 0)`))
      .limit(20);

    let userPoints = 0;
    let userRank = 0;
    if (session && me) {
      const userRow = rows.find((r) => r.userId === session.userId);
      userPoints = userRow?.totalPoints || 0;
      userRank = rows.findIndex((r) => r.userId === session.userId) + 1;
    }

    return NextResponse.json({
      success: true,
      period,
      leaderboard: rows,
      points: userPoints,
      rank: userRank,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}
