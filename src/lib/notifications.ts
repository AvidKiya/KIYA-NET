import { db } from "@/db";
import { notifications, notificationPreferences, users } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  orderId?: string;
  type?: "ORDER" | "PAYMENT" | "CHAT" | "SYSTEM";
}

/**
 * Create a new notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  const { userId, title, message, orderId } = params;

  const notification = await db
    .insert(notifications)
    .values({
      id: nanoid(12),
      userId,
      title,
      message,
      orderId,
      isRead: false,
    })
    .returning();

  // TODO: Send push notification / email / SMS based on user preferences
  await sendPushNotificationIfEnabled(userId, title, message);

  return notification[0];
}

/**
 * Get unread notifications for a user
 */
export async function getUserNotifications(userId: string, limit = 20) {
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(notifications.createdAt)
    .limit(limit);
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  return await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}

/**
 * Send push notification (placeholder for now)
 */
async function sendPushNotificationIfEnabled(userId: string, title: string, message: string) {
  // In production: integrate with Firebase, OneSignal, or Web Push API
  console.log(`[PUSH] To user ${userId}: ${title} - ${message}`);
  
  // Example: Check user preferences
  const prefs = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (prefs[0]?.pushEnabled) {
    // Send actual push notification here
  }
}

/**
 * Create notification when order status changes
 */
export async function notifyOrderStatusChange(
  userId: string,
  orderId: string,
  newStatus: string
) {
  const statusMessages: Record<string, string> = {
    UNDER_REVIEW: "سفارش شما در حال بررسی است",
    IN_PROGRESS: "اپراتور در حال انجام سفارش شماست",
    COMPLETED: "سفارش شما با موفقیت تکمیل شد",
    NEEDS_INFO: "نیاز به اطلاعات بیشتر دارید",
    CANCELLED: "سفارش شما لغو شد",
  };

  const message = statusMessages[newStatus] || `وضعیت سفارش به ${newStatus} تغییر کرد`;

  return createNotification({
    userId,
    title: "به‌روزرسانی سفارش",
    message,
    orderId,
  });
}