import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { KiyaOrderDocument } from "@/lib/pdf/kiyaDocument";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.trackingCode, code.toUpperCase()))
    .limit(1);

  if (!order) {
    return NextResponse.json({ ok: false, error: "سفارش پیدا نشد." }, { status: 404 });
  }

  const url = new URL(request.url);
  const requestedMode = url.searchParams.get("type") === "delivery" ? "delivery" : "receipt";
  const mode =
    requestedMode === "delivery" && order.status !== "delivered" && order.status !== "completed"
      ? "receipt"
      : requestedMode;

  try {
    const buffer = await renderToBuffer(<KiyaOrderDocument order={order} mode={mode} />);
    const filename = `kiya-net-${mode === "delivery" ? "delivery" : "receipt"}-${order.trackingCode}.pdf`;
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to render PDF", error);
    return NextResponse.json({ ok: false, error: "ساخت فایل PDF با خطا مواجه شد." }, { status: 500 });
  }
}
