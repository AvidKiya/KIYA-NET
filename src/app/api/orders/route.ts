export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, services, users, pendingPayments } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { nanoid } from "nanoid";
import { getCurrentUser } from "@/lib/auth";
import { createPaymentRequest } from "@/lib/payment/gateway";

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

    const { serviceId, userNotes, quantity, urgent, paymentMethod } = await req.json();

    if (!serviceId) {
      return NextResponse.json({ error: "خدمت انتخاب نشده است" }, { status: 400 });
    }

    const service = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!service) {
      return NextResponse.json({ error: "خدمت یافت نشد" }, { status: 404 });
    }

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
    const baseAmount = parseFloat(service.kiyanetPrice) * (Number(quantity) || 1);
    const surchargePercent = urgent ? 0.3 : 0;
    const totalAmount = Math.round(baseAmount * (1 + surchargePercent));

    let paymentStatus: "PAID" | "PENDING" = "PENDING";
    let finalPaymentMethod: "WALLET" | "ONLINE_GATEWAY" | "CARD_TO_CARD" | null = null;
    let paymentUrl: string | null = null;
    let gatewayAuthority: string | null = null;

    if (paymentMethod === "WALLET") {
      const walletBalance = parseFloat(user.walletBalance || "0");
      if (walletBalance < totalAmount) {
        return NextResponse.json({ error: "موجودی کیف پول کافی نیست" }, { status: 400 });
      }
      await db
        .update(users)
        .set({ walletBalance: (walletBalance - totalAmount).toFixed(2), updatedAt: new Date() })
        .where(eq(users.id, user.id));

      const { walletTransactions } = await import("@/db/schema");
      await db.insert(walletTransactions).values({
        id: uuid(),
        userId: user.id,
        amount: (-totalAmount).toFixed(2),
        type: "PAYMENT",
        orderId,
        description: `پرداخت بابت سفارش ${orderId} - ${service.serviceName}`,
      } as any);

      paymentStatus = "PAID";
      finalPaymentMethod = "WALLET";
    } else if (paymentMethod === "ONLINE_GATEWAY") {
      const authorityId = nanoid();
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://kiya-net.pages.dev"}/api/payment/callback?authority=${authorityId}`;
      const gatewayResult = await createPaymentRequest({
        amount: totalAmount,
        description: `پرداخت سفارش ${orderId}`,
        callbackUrl,
        mobile: user.phoneNumber || undefined,
        metadata: { internalAuthority: authorityId, type: "ORDER_PAYMENT", orderId },
      });

      if (!gatewayResult.success || !gatewayResult.authority) {
        return NextResponse.json({ error: gatewayResult.error || "خطا در ایجاد درخواست پرداخت" }, { status: 500 });
      }

      await db.insert(pendingPayments).values({
        id: authorityId,
        userId: user.id,
        type: "ORDER_PAYMENT",
        amount: String(totalAmount),
        gateway: gatewayResult.gateway,
        authority: gatewayResult.authority,
        status: "PENDING",
        orderId,
        description: `پرداخت سفارش ${orderId}`,
        callbackUrl,
        metadata: { internalAuthority: authorityId, externalAuthority: gatewayResult.authority },
      });

      paymentUrl = gatewayResult.paymentUrl || null;
      gatewayAuthority = authorityId;
      finalPaymentMethod = "ONLINE_GATEWAY";
    } else if (paymentMethod === "CARD_TO_CARD") {
      finalPaymentMethod = "CARD_TO_CARD";
      paymentStatus = "PENDING";
    } else {
      return NextResponse.json({ error: "روش پرداخت نامعتبر" }, { status: 400 });
    }

    await db.insert(orders).values({
      id: orderId,
      userId: user.id,
      serviceId,
      status: "PENDING_ASSIGNMENT",
      totalAmount: totalAmount.toFixed(2),
      paymentStatus,
      paymentMethod: finalPaymentMethod as any,
      userNotes,
    });

    const { notifications } = await import("@/db/schema");
    const operators = await db.select().from(users).where(eq(users.role, "OPERATOR"));
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
        paymentMethod: finalPaymentMethod,
        serviceName: service.serviceName,
        paymentUrl,
        gatewayAuthority,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "خطا در ثبت سفارش" }, { status: 500 });
  }
}
