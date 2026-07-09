export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cardToCardReceipts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const receipts = await db
      .select({
        id: cardToCardReceipts.id,
        userId: cardToCardReceipts.userId,
        orderId: cardToCardReceipts.orderId,
        amount: cardToCardReceipts.amount,
        receiptUrl: cardToCardReceipts.receiptUrl,
        status: cardToCardReceipts.status,
        rejectionReason: cardToCardReceipts.rejectionReason,
        verifiedBy: cardToCardReceipts.verifiedBy,
        createdAt: cardToCardReceipts.createdAt,
        phone: users.phoneNumber,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(cardToCardReceipts)
      .leftJoin(users, eq(cardToCardReceipts.userId, users.id))
      .orderBy(desc(cardToCardReceipts.createdAt));

    return NextResponse.json({ receipts });
  } catch (error) {
    console.error("Get receipts error:", error);
    return NextResponse.json({ error: "خطا در بارگذاری رسیدها" }, { status: 500 });
  }
}
