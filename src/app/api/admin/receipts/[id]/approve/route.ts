export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cardToCardReceipts, users, walletTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id } = await params;
    const receipt = await db
      .select()
      .from(cardToCardReceipts)
      .where(eq(cardToCardReceipts.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!receipt) return NextResponse.json({ error: "رسید یافت نشد" }, { status: 404 });
    if (receipt.status !== "PENDING") return NextResponse.json({ error: "این رسید قبلاً بررسی شده" }, { status: 400 });

    const user = await db.select().from(users).where(eq(users.id, receipt.userId)).limit(1).then((r) => r[0]);
    if (!user) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });

    const newBalance = parseFloat(user.walletBalance || "0") + Number(receipt.amount);
    await db
      .update(users)
      .set({ walletBalance: String(newBalance), updatedAt: new Date() })
      .where(eq(users.id, user.id));

    await db.insert(walletTransactions).values({
      id: nanoid(),
      userId: user.id,
      amount: receipt.amount,
      type: "CHARGE",
      description: `شارژ کیف پول از طریق کارت به کارت — رسید ${id}`,
    } as any);

    await db
      .update(cardToCardReceipts)
      .set({ status: "APPROVED", verifiedBy: session.userId })
      .where(eq(cardToCardReceipts.id, id));

    return NextResponse.json({ success: true, message: "رسید تأیید و موجودی شارژ شد" });
  } catch (error) {
    console.error("Approve receipt error:", error);
    return NextResponse.json({ error: "خطا در تأیید رسید" }, { status: 500 });
  }
}
