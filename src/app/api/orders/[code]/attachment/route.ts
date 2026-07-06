import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const { code } = await params;
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.trackingCode, code.toUpperCase()))
    .limit(1);

  if (!order || !order.attachmentData) {
    return NextResponse.json({ ok: false, error: "فایلی یافت نشد." }, { status: 404 });
  }

  const buffer = Buffer.from(order.attachmentData, "base64");
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": order.attachmentMime || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${order.attachmentName ?? "attachment"}"`,
    },
  });
}
