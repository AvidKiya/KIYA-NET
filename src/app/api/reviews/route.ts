import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { serviceReviews, services } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from "nanoid";
import { eq, avg, count } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { serviceId, rating, comment } = await req.json();

  if (!serviceId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const review = await db
    .insert(serviceReviews)
    .values({
      id: nanoid(12),
      serviceId,
      userId: user.id,
      rating,
      comment: comment || null,
      isVerified: true,
    })
    .returning();

  return NextResponse.json(review[0]);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");

  if (!serviceId) {
    return NextResponse.json({ error: "serviceId required" }, { status: 400 });
  }

  const reviews = await db
    .select()
    .from(serviceReviews)
    .where(eq(serviceReviews.serviceId, parseInt(serviceId)))
    .orderBy(serviceReviews.createdAt);

  const avgRating = await db
    .select({ avg: avg(serviceReviews.rating) })
    .from(serviceReviews)
    .where(eq(serviceReviews.serviceId, parseInt(serviceId)));

  const total = await db
    .select({ count: count() })
    .from(serviceReviews)
    .where(eq(serviceReviews.serviceId, parseInt(serviceId)));

  return NextResponse.json({
    reviews,
    average: avgRating[0]?.avg || 0,
    total: total[0]?.count || 0,
  });
}