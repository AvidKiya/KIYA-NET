export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cardToCardReceipts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id } = await params;
    const { reason } = await req.json();

    const receipt = await db
      .select()
      .from(cardToCardReceipts)
      .where(eq(cardToCardReceipts.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!receipt) return NextResponse.json({ error: "رسید یافت نشد" }, { status: 404 });
    if (receipt.status !== "PENDING") return NextResponse.json({ error: "این رسید قبلاً بررسی شده" }, { status: 400 });

    await db
      .update(cardToCardReceipts)
      .set({ status: "REJECTED", rejectionReason: reason || "رد شده", verifiedBy: session.userId })
      .where(eq(cardToCardReceipts.id, id));

    return NextResponse.json({ success: true, message: "رسید رد شد" });
  } catch (error) {
    console.error("Reject receipt error:", error);
    return NextResponse.json({ error: "خطا در رد رسید" }, { status: 500 });
  }
}
