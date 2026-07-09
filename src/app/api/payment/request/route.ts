export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pendingPayments, orders, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { createPaymentRequest, PaymentGateway } from "@/lib/payment/gateway";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const body = await req.json();
    const { type, amount, description, orderId, gateway } = body;

    if (!type || (type !== "WALLET_CHARGE" && type !== "ORDER_PAYMENT")) {
      return NextResponse.json({ error: "نوع پرداخت نامعتبر" }, { status: 400 });
    }

    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount < 1000) {
      return NextResponse.json({ error: "حداقل مبلغ ۱۰۰۰ تومان است" }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.id, session.userId)).limit(1).then((r) => r[0]);
    if (!user) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });

    let finalAmount = paymentAmount;
    let finalDescription = description || (type === "WALLET_CHARGE" ? "شارژ کیف پول" : "پرداخت سفارش");
    let linkedOrderId: string | null = null;

    if (type === "ORDER_PAYMENT") {
      if (!orderId) return NextResponse.json({ error: "شناسه سفارش الزامی است" }, { status: 400 });
      const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1).then((r) => r[0]);
      if (!order) return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
      if (order.userId !== user.id) return NextResponse.json({ error: "سفارش متعلق به شما نیست" }, { status: 403 });
      if (order.paymentStatus === "PAID") return NextResponse.json({ error: "این سفارش قبلاً پرداخت شده" }, { status: 400 });
      finalAmount = Number(order.totalAmount);
      finalDescription = `پرداخت سفارش ${orderId}`;
      linkedOrderId = orderId;
    }

    const authorityId = nanoid();
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin}/payment/callback?authority=${authorityId}`;

    const gatewayResult = await createPaymentRequest(
      {
        amount: finalAmount,
        description: finalDescription,
        callbackUrl,
        mobile: user.phoneNumber || undefined,
        metadata: { internalAuthority: authorityId, type, ...(linkedOrderId ? { orderId: linkedOrderId } : {}) },
      },
      gateway as PaymentGateway | undefined
    );

    if (!gatewayResult.success || !gatewayResult.authority) {
      return NextResponse.json({ error: gatewayResult.error || "خطا در ایجاد درخواست پرداخت" }, { status: 500 });
    }

    await db.insert(pendingPayments).values({
      id: authorityId,
      userId: user.id,
      type,
      amount: String(finalAmount),
      gateway: gatewayResult.gateway,
      authority: gatewayResult.authority,
      status: "PENDING",
      orderId: linkedOrderId,
      description: finalDescription,
      callbackUrl,
      metadata: { internalAuthority: authorityId, externalAuthority: gatewayResult.authority },
    });

    return NextResponse.json({
      success: true,
      authority: authorityId,
      paymentUrl: gatewayResult.paymentUrl,
      gateway: gatewayResult.gateway,
      amount: finalAmount,
    });
  } catch (error) {
    console.error("Payment request error:", error);
    return NextResponse.json({ error: "خطا در درخواست پرداخت" }, { status: 500 });
  }
}
