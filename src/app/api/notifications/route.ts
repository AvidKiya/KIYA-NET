import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createNotification, getUserNotifications, markNotificationAsRead } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await getUserNotifications(user.id);
  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, message, orderId } = body;

  if (!title || !message) {
    return NextResponse.json({ error: "title and message required" }, { status: 400 });
  }

  const notification = await createNotification({
    userId: user.id,
    title,
    message,
    orderId,
  });

  return NextResponse.json(notification);
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { notificationId } = await req.json();
  if (!notificationId) {
    return NextResponse.json({ error: "notificationId required" }, { status: 400 });
  }

  await markNotificationAsRead(notificationId);
  return NextResponse.json({ success: true });
}