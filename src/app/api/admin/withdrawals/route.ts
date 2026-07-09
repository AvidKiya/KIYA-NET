export const runtime = "edge";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { withdrawalRequests, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const data = await db
      .select({
        id: withdrawalRequests.id,
        amount: withdrawalRequests.amount,
        status: withdrawalRequests.status,
        receiptUrl: withdrawalRequests.receiptUrl,
        adminNote: withdrawalRequests.adminNote,
        createdAt: withdrawalRequests.createdAt,
        processedAt: withdrawalRequests.processedAt,
        operatorId: withdrawalRequests.operatorId,
        operatorPhone: users.phoneNumber,
        operatorName: users.firstName,
      })
      .from(withdrawalRequests)
      .leftJoin(users, eq(withdrawalRequests.operatorId, users.id))
      .orderBy(desc(withdrawalRequests.createdAt));

    return NextResponse.json({ withdrawals: data });
  } catch (error) {
    console.error("Withdrawals list error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}
