import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, users, walletTransactions, operatorRatings } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql, and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  // Total Orders
  const totalOrders = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders);

  // Orders in last N days
  const recentOrders = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(gte(orders.createdAt, since));

  // Completed Orders
  const completedOrders = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, "COMPLETED"));

  // Total Revenue
  const revenue = await db
    .select({ total: sql<number>`sum(${orders.totalAmount})` })
    .from(orders)
    .where(eq(orders.status, "COMPLETED"));

  // Active Users
  const activeUsers = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.isActive, true));

  // Average Rating
  const avgRating = await db
    .select({ avg: sql<number>`avg(${operatorRatings.rating})` })
    .from(operatorRatings);

  // Orders by status
  const statusBreakdown = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .groupBy(orders.status);

  // Top 5 operators by completed orders
  const topOperators = await db
    .select({
      operatorId: orders.operatorId,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(eq(orders.status, "COMPLETED"))
    .groupBy(orders.operatorId)
    .orderBy(sql`count(*) desc`)
    .limit(5);

  return NextResponse.json({
    period: `${days} days`,
    totalOrders: totalOrders[0]?.count || 0,
    recentOrders: recentOrders[0]?.count || 0,
    completedOrders: completedOrders[0]?.count || 0,
    totalRevenue: revenue[0]?.total || 0,
    activeUsers: activeUsers[0]?.count || 0,
    averageRating: avgRating[0]?.avg || 0,
    statusBreakdown,
    topOperators,
  });
}