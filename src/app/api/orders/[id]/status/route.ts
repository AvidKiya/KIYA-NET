import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, notifications, users, walletTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "edge";
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = [
      "PENDING_ASSIGNMENT",
      "UNDER_REVIEW",
      "NEEDS_INFO",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "وضعیت نامعتبر" }, { status: 400 });
    }

    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!order) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { status };

    if (status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    // If cancelled, refund to wallet
    if (status === "CANCELLED" && order.paymentStatus === "PAID") {
      const amount = parseFloat(order.totalAmount);
      const customer = await db
        .select()
        .from(users)
        .where(eq(users.id, order.userId))
        .limit(1)
        .then((r) => r[0]);

      if (customer) {
        const newBalance = parseFloat(customer.walletBalance || "0") + amount;
        await db
          .update(users)
          .set({ walletBalance: newBalance.toFixed(2) })
          .where(eq(users.id, customer.id));

        await db.insert(walletTransactions).values({
          id: uuid(),
          userId: customer.id,
          amount: amount.toFixed(2),
          type: "REFUND",
          orderId: id,
          description: `عودت وجه بابت لغو سفارش ${id}`,
        });

        updateData.paymentStatus = "REFUNDED";
      }
    }

    await db.update(orders).set(updateData).where(eq(orders.id, id));

    // Notify customer
    const statusMessages: Record<string, string> = {
      NEEDS_INFO: "اپراتور درخواست مدارک تکمیلی دارد",
      IN_PROGRESS: "اپراتور در حال انجام کار شماست",
      COMPLETED: "سفارش شما تکمیل شد",
      CANCELLED: "سفارش شما لغو و وجه به کیف پول بازگشت",
    };

    if (statusMessages[status]) {
      await db.insert(notifications).values({
        id: uuid(),
        userId: order.userId,
        title: "بروزرسانی سفارش",
        message: statusMessages[status],
        orderId: id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}
