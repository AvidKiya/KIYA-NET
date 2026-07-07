export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, walletTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

    const { amount, method } = await req.json();

    if (!amount || Number(amount) < 1000) {
      return NextResponse.json({ error: "حداقل مبلغ ۱۰۰۰ تومان است" }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.id, session.userId)).limit(1).then(r => r[0]);
    if (!user) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });

    // In production: redirect to payment gateway
    // For now: simulate charge
    const newBalance = parseFloat(user.walletBalance || "0") + Number(amount);

    await db.update(users).set({ walletBalance: String(newBalance), updatedAt: new Date() } as any).where(eq(users.id, user.id));

    await db.insert(walletTransactions).values({
      id: uuid(),
      userId: user.id,
      amount: String(amount),
      type: "CHARGE",
      description: `شارژ کیف پول — ${method === "card" ? "کارت به کارت" : "درگاه پرداخت"}`,
    } as any);

    return NextResponse.json({ success: true, balance: newBalance, message: "کیف پول با موفقیت شارژ شد" });
  } catch (error) {
    console.error("Wallet charge error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}
