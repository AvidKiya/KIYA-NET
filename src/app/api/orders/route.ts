import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, services, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "edge";
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    const validStatuses = [
      "PENDING_ASSIGNMENT",
      "UNDER_REVIEW",
      "NEEDS_INFO",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ] as const;

    let conditions: ReturnType<typeof eq>[] = [];
    if (session.role === "CUSTOMER") {
      conditions.push(eq(orders.userId, session.userId));
    } else if (session.role === "OPERATOR") {
      if (statusParam === "PENDING_ASSIGNMENT") {
        conditions.push(eq(orders.status, "PENDING_ASSIGNMENT" as const));
      } else {
        conditions.push(eq(orders.operatorId, session.userId));
      }
    }

    if (
      statusParam &&
      session.role !== "OPERATOR" &&
      validStatuses.includes(statusParam as typeof validStatuses[number])
    ) {
      conditions.push(
        eq(orders.status, statusParam as typeof validStatuses[number])
      );
    }

    const data = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        operatorId: orders.operatorId,
        serviceId: orders.serviceId,
        status: orders.status,
        totalAmount: orders.totalAmount,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        userNotes: orders.userNotes,
        adminNotes: orders.adminNotes,
        finalOutputFile: orders.finalOutputFile,
        shippingTrackingCode: orders.shippingTrackingCode,
        completedAt: orders.completedAt,
        createdAt: orders.createdAt,
        serviceName: services.serviceName,
        serviceCategoryColor: services.categoryId,
        customerPhone: users.phoneNumber,
        customerName: users.firstName,
      })
      .from(orders)
      .leftJoin(services, eq(orders.serviceId, services.id))
      .leftJoin(users, eq(orders.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({ orders: data });
  } catch (error) {
    console.error("Orders error:", error);
    return NextResponse.json({ error: "خطا در بارگذاری سفارش‌ها" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { serviceId, userNotes } = await req.json();

    if (!serviceId) {
      return NextResponse.json({ error: "خدمت انتخاب نشده است" }, { status: 400 });
    }

    // Get service price
    const service = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!service) {
      return NextResponse.json({ error: "خدمت یافت نشد" }, { status: 404 });
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    const orderId = `KIYA-${Math.floor(Math.random() * 9000) + 1000}`;
    const totalAmount = parseFloat(service.kiyanetPrice);

    // Check wallet balance
    const walletBalance = parseFloat(user.walletBalance || "0");
    let paymentStatus: "PAID" | "PENDING" = "PENDING";
    let paymentMethod: "WALLET" | "ONLINE_GATEWAY" | null = null;

    if (walletBalance >= totalAmount) {
      // Auto-pay from wallet
      await db
        .update(users)
        .set({ walletBalance: (walletBalance - totalAmount).toFixed(2) })
        .where(eq(users.id, user.id));

      // Record wallet transaction
      const { walletTransactions } = await import("@/db/schema");
      await db.insert(walletTransactions).values({
        id: uuid(),
        userId: user.id,
        amount: (-totalAmount).toFixed(2),
        type: "PAYMENT",
        orderId,
        description: `پرداخت بابت سفارش ${orderId} - ${service.serviceName}`,
      });

      paymentStatus = "PAID";
      paymentMethod = "WALLET";
    }

    await db.insert(orders).values({
      id: orderId,
      userId: user.id,
      serviceId,
      status: "PENDING_ASSIGNMENT",
      totalAmount: totalAmount.toFixed(2),
      paymentStatus,
      paymentMethod,
      userNotes,
    });

    // Create notification for admins/operators
    const { notifications } = await import("@/db/schema");

    // Find operators
    const operators = await db
      .select()
      .from(users)
      .where(eq(users.role, "OPERATOR"));

    for (const op of operators) {
      await db.insert(notifications).values({
        id: uuid(),
        userId: op.id,
        title: "سفارش جدید",
        message: `سفارش جدید ${orderId} برای ${service.serviceName} ثبت شد`,
        orderId,
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        totalAmount,
        paymentStatus,
        paymentMethod,
        serviceName: service.serviceName,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "خطا در ثبت سفارش" }, { status: 500 });
  }
}
