import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orderChatMessages, orders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from "nanoid";
import { eq, and, gt } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const since = searchParams.get("since");

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  // Verify user has access to this order
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order[0] || (order[0].userId !== user.id && order[0].operatorId !== user.id && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  let query = db
    .select()
    .from(orderChatMessages)
    .where(eq(orderChatMessages.orderId, orderId))
    .orderBy(orderChatMessages.createdAt);

  if (since) {
    query = query.where(gt(orderChatMessages.createdAt, new Date(since)));
  }

  const messages = await query;
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { orderId, messageText, messageType = "TEXT", attachmentUrl } = body;

  if (!orderId || !messageText) {
    return NextResponse.json({ error: "orderId and messageText required" }, { status: 400 });
  }

  // Verify access
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order[0] || (order[0].userId !== user.id && order[0].operatorId !== user.id && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const newMessage = await db
    .insert(orderChatMessages)
    .values({
      id: nanoid(12),
      orderId,
      senderId: user.id,
      messageText,
      attachmentUrl: attachmentUrl || null,
      messageType,
    })
    .returning();

  // Create notification for the other party
  const otherPartyId = order[0].userId === user.id ? order[0].operatorId : order[0].userId;
  if (otherPartyId) {
    // In a real app, trigger notification here
  }

  return NextResponse.json(newMessage[0]);
}