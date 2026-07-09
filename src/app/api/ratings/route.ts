import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { operatorRatings, orders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from "nanoid";
import { eq, and, avg, count } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { orderId, rating, comment } = body;

  if (!orderId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Check if order belongs to user and is completed
  const order = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)))
    .limit(1);

  if (!order[0] || order[0].status !== "COMPLETED") {
    return NextResponse.json({ error: "Order not eligible for rating" }, { status: 400 });
  }

  if (!order[0].operatorId) {
    return NextResponse.json({ error: "No operator assigned" }, { status: 400 });
  }

  // Check if already rated
  const existing = await db
    .select()
    .from(operatorRatings)
    .where(eq(operatorRatings.orderId, orderId))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "Already rated" }, { status: 400 });
  }

  const newRating = await db
    .insert(operatorRatings)
    .values({
      id: nanoid(12),
      orderId,
      userId: user.id,
      operatorId: order[0].operatorId,
      rating,
      comment: comment || null,
    })
    .returning();

  return NextResponse.json(newRating[0]);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const operatorId = searchParams.get("operatorId");

  if (!operatorId) {
    return NextResponse.json({ error: "operatorId required" }, { status: 400 });
  }

  const ratings = await db
    .select()
    .from(operatorRatings)
    .where(eq(operatorRatings.operatorId, operatorId))
    .orderBy(operatorRatings.createdAt);

  const avgRating = await db
    .select({ avg: avg(operatorRatings.rating) })
    .from(operatorRatings)
    .where(eq(operatorRatings.operatorId, operatorId));

  const total = await db
    .select({ count: count() })
    .from(operatorRatings)
    .where(eq(operatorRatings.operatorId, operatorId));

  return NextResponse.json({
    ratings,
    average: avgRating[0]?.avg || 0,
    total: total[0]?.count || 0,
  });
}