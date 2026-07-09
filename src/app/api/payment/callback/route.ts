export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pendingPayments, orders, users, walletTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPayment } from "@/lib/payment/gateway";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const internalAuthority = searchParams.get("authority");
    const externalAuthority = searchParams.get("Authority") || searchParams.get("authority");
    const status = searchParams.get("Status") || "OK";
    const refId = searchParams.get("RefID") || searchParams.get("refId") || undefined;

    if (!internalAuthority) {
      return NextResponse.redirect(new URL("/payment/callback?status=failed&error=missing_authority", req.url));
    }

    const payment = await db
      .select()
      .from(pendingPayments)
      .where(eq(pendingPayments.id, internalAuthority))
      .limit(1)
      .then((r) => r[0]);

    if (!payment) {
      return NextResponse.redirect(new URL("/payment/callback?status=failed&error=payment_not_found", req.url));
    }

    if (payment.status === "PAID") {
      return NextResponse.redirect(new URL(`/payment/callback?status=success&authority=${internalAuthority}&refId=${payment.refId || ""}`, req.url));
    }

    const verifyResult = await verifyPayment(
      {
        authority: externalAuthority || payment.authority,
        amount: Number(payment.amount),
        status: status || "OK",
        refId,
      },
      payment.gateway as any
    );

    if (!verifyResult.success) {
      await db
        .update(pendingPayments)
        .set({ status: "FAILED", updatedAt: new Date() })
        .where(eq(pendingPayments.id, internalAuthority));
      return NextResponse.redirect(new URL(`/payment/callback?status=failed&authority=${internalAuthority}&error=${encodeURIComponent(verifyResult.error || "verification_failed")}`, req.url));
    }

    // Payment verified — apply to wallet or order
    const user = await db.select().from(users).where(eq(users.id, payment.userId)).limit(1).then((r) => r[0]);
    if (!user) {
      return NextResponse.redirect(new URL("/payment/callback?status=failed&error=user_not_found", req.url));
    }

    if (payment.type === "WALLET_CHARGE") {
      const newBalance = parseFloat(user.walletBalance || "0") + Number(payment.amount);
      await db
        .update(users)
        .set({ walletBalance: String(newBalance), updatedAt: new Date() })
        .where(eq(users.id, user.id));

      await db.insert(walletTransactions).values({
        id: nanoid(),
        userId: user.id,
        amount: payment.amount,
        type: "CHARGE",
        description: `شارژ کیف پول از درگاه ${payment.gateway} — ref: ${verifyResult.refId}`,
      } as any);
    } else if (payment.type === "ORDER_PAYMENT" && payment.orderId) {
      await db
        .update(orders)
        .set({ paymentStatus: "PAID", paymentMethod: "ONLINE_GATEWAY", updatedAt: new Date() })
        .where(eq(orders.id, payment.orderId));

      await db.insert(walletTransactions).values({
        id: nanoid(),
        userId: user.id,
        amount: (-Number(payment.amount)).toFixed(2),
        type: "PAYMENT",
        orderId: payment.orderId,
        description: `پرداخت سفارش ${payment.orderId} از درگاه ${payment.gateway} — ref: ${verifyResult.refId}`,
      } as any);
    }

    await db
      .update(pendingPayments)
      .set({
        status: "PAID",
        refId: verifyResult.refId,
        cardPan: verifyResult.cardPan,
        updatedAt: new Date(),
      })
      .where(eq(pendingPayments.id, internalAuthority));

    return NextResponse.redirect(
      new URL(`/payment/callback?status=success&authority=${internalAuthority}&refId=${verifyResult.refId || ""}&type=${payment.type}`, req.url)
    );
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(new URL("/payment/callback?status=failed&error=server_error", req.url));
  }
}
