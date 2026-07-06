import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateOrderSchema } from "@/lib/validation";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

async function getOrderByCode(code: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.trackingCode, code.toUpperCase()))
    .limit(1);
  return order ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const order = await getOrderByCode(code);
  if (!order) {
    return NextResponse.json({ ok: false, error: "سفارشی با این کد رهگیری پیدا نشد." }, { status: 404 });
  }
  const { attachmentData, ...rest } = order;
  return NextResponse.json({ ok: true, order: { ...rest, hasAttachment: Boolean(attachmentData) } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const { code } = await params;
  const order = await getOrderByCode(code);
  if (!order) {
    return NextResponse.json({ ok: false, error: "سفارش پیدا نشد." }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بدنه درخواست نامعتبر است." }, { status: 400 });
  }

  const parsed = updateOrderSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "اطلاعات نامعتبر است." }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.status) {
    updates.status = parsed.data.status;
    if (parsed.data.status === "delivered") {
      updates.deliveredAt = new Date();
    }
  }
  if (typeof parsed.data.adminNote === "string") {
    updates.adminNote = parsed.data.adminNote;
  }

  const [updated] = await db
    .update(orders)
    .set(updates)
    .where(eq(orders.trackingCode, order.trackingCode))
    .returning();

  const { attachmentData, ...rest } = updated;
  return NextResponse.json({ ok: true, order: { ...rest, hasAttachment: Boolean(attachmentData) } });
}
