export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id } = await params;
    await db
      .update(orders)
      .set({ operatorId: session.userId, status: "UNDER_REVIEW" })
      .where(eq(orders.id, id));

    // Notify customer
    const order = await db.select().from(orders).where(eq(orders.id, id)).limit(1).then(r => r[0]);
    if (order) {
      await db.insert(notifications).values({
        id: uuid(),
        userId: order.userId,
        title: "اپراتور assigned",
        message: `سفارش ${id} به اپراتور اختصاص یافت و در حال بررسی است`,
        orderId: id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Assign error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}
