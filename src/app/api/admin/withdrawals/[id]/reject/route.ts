export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { withdrawalRequests, users, walletTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id } = await params;
    const { reason } = await req.json();

    const existing = await db.select().from(withdrawalRequests).where(eq(withdrawalRequests.id, id)).limit(1).then((r) => r[0]);
    if (!existing) {
      return NextResponse.json({ error: "درخواست یافت نشد" }, { status: 404 });
    }

    if (existing.status !== "PENDING") {
      return NextResponse.json({ error: "این درخواست قبلاً پردازش شده" }, { status: 400 });
    }

    const operator = await db.select().from(users).where(eq(users.id, existing.operatorId)).limit(1).then((r) => r[0]);
    if (operator) {
      const amount = parseFloat(existing.amount);
      const newBalance = parseFloat(operator.walletBalance || "0") + amount;
      await db.update(users).set({ walletBalance: newBalance.toFixed(2) }).where(eq(users.id, operator.id));

      await db.insert(walletTransactions).values({
        id: uuid(),
        userId: operator.id,
        amount: amount.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        type: "WITHDRAWAL_REFUND",
        withdrawalId: id,
        description: reason ? `برگشت برداشت — ${reason}` : "برگشت برداشت",
      });
    }

    await db
      .update(withdrawalRequests)
      .set({
        status: "REJECTED",
        adminNote: reason || null,
        processedAt: new Date(),
      })
      .where(eq(withdrawalRequests.id, id));

    return NextResponse.json({ success: true, message: "درخواست برداشت رد و مبلغ به کیف پول برگشت" });
  } catch (error) {
    console.error("Withdrawal reject error:", error);
    return NextResponse.json({ error: "خطا در رد برداشت" }, { status: 500 });
  }
}
