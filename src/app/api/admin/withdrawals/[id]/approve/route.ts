export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { withdrawalRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    const { receiptUrl, adminNote } = await req.json();

    const existing = await db.select().from(withdrawalRequests).where(eq(withdrawalRequests.id, id)).limit(1).then((r) => r[0]);
    if (!existing) {
      return NextResponse.json({ error: "درخواست یافت نشد" }, { status: 404 });
    }

    await db
      .update(withdrawalRequests)
      .set({
        status: "APPROVED",
        receiptUrl: receiptUrl || null,
        adminNote: adminNote || null,
        processedAt: new Date(),
      })
      .where(eq(withdrawalRequests.id, id));

    return NextResponse.json({ success: true, message: "درخواست برداشت تأیید و تسویه شد" });
  } catch (error) {
    console.error("Withdrawal approve error:", error);
    return NextResponse.json({ error: "خطا در تأیید برداشت" }, { status: 500 });
  }
}
