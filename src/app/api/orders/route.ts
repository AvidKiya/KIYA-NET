import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiLimiter } from "@/lib/rate-limit";
import { db } from "@/db";
import { orders, services } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(orders.createdAt);

  return NextResponse.json({ orders: userOrders });
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const limit = await apiLimiter(req);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { serviceId, notes, isExpress } = body;

  if (!serviceId) {
    return NextResponse.json({ error: "serviceId required" }, { status: 400 });
  }

  const service = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);
  if (!service.length) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const total = isExpress 
    ? Math.round(Number(service[0].kiyanetPrice) * 1.3) 
    : Number(service[0].kiyanetPrice);

  const newOrder = await db
    .insert(orders)
    .values({
      id: `KIYA-${nanoid(8).toUpperCase()}`,
      userId: user.id,
      serviceId,
      status: "PENDING_ASSIGNMENT",
      totalAmount: String(total),
      isExpress: !!isExpress,
      userNotes: notes || null,
    })
    .returning();

  return NextResponse.json({ order: newOrder[0] });
}