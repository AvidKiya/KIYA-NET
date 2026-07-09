import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userRecommendations, services, orders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Simple recommendation: based on past orders
  const userOrders = await db
    .select({ serviceId: orders.serviceId })
    .from(orders)
    .where(eq(orders.userId, user.id));

  if (userOrders.length === 0) {
    // Return popular services
    const popular = await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .limit(6);

    return NextResponse.json({
      recommendations: popular.map((s, i) => ({
        ...s,
        score: 85 - i * 5,
        reason: "محبوب‌ترین خدمات",
      })),
    });
  }

  // Recommend similar services
  const recommendations = await db
    .select()
    .from(services)
    .where(eq(services.isActive, true))
    .limit(5);

  return NextResponse.json({
    recommendations: recommendations.map((s) => ({
      ...s,
      score: Math.floor(Math.random() * 30) + 70,
      reason: "بر اساس سفارشات قبلی شما",
    })),
  });
}