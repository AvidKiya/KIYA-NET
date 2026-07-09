export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, walletTransactions, withdrawalRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { amount, note } = await req.json();
    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      return NextResponse.json({ error: "مبلغ نامعتبر است" }, { status: 400 });
    }

    const operator = await db.select().from(users).where(eq(users.id, session.userId)).limit(1).then((r) => r[0]);
    if (!operator) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });

    const balance = parseFloat(operator.walletBalance || "0");
    if (withdrawAmount > balance) {
      return NextResponse.json({ error: "موجودی کافی نیست" }, { status: 400 });
    }

    const newBalance = balance - withdrawAmount;
    const withdrawalId = uuid();
    await db.update(users).set({ walletBalance: newBalance.toFixed(2) }).where(eq(users.id, operator.id));
    await db.insert(walletTransactions).values({
      id: uuid(),
      userId: operator.id,
      amount: (-withdrawAmount).toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      type: "WITHDRAWAL",
      withdrawalId,
      description: note ? `درخواست برداشت — ${note}` : "درخواست برداشت",
    });
    await db.insert(withdrawalRequests).values({
      id: withdrawalId,
      operatorId: operator.id,
      amount: withdrawAmount.toFixed(2),
      status: "PENDING",
      adminNote: note || null,
    });

    return NextResponse.json({ success: true, withdrawalId, message: "درخواست برداشت ثبت شد" });
  } catch (error) {
    console.error("Withdrawal request error:", error);
    return NextResponse.json({ error: "خطا در ثبت درخواست برداشت" }, { status: 500 });
  }
}
