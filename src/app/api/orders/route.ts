import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { createOrderSchema } from "@/lib/validation";
import { generateTrackingCode } from "@/lib/format";
import { findService } from "@/lib/services";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // ~5MB decoded

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بدنه درخواست نامعتبر است." }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "اطلاعات ارسالی نامعتبر است.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const input = parsed.data;
  const { category, service } = findService(input.categorySlug, input.serviceSlug);
  if (!category || !service) {
    return NextResponse.json({ ok: false, error: "خدمت انتخاب‌شده معتبر نیست." }, { status: 400 });
  }

  if (input.attachment) {
    const approxBytes = Math.floor((input.attachment.data.length * 3) / 4);
    if (approxBytes > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json(
        { ok: false, error: "حجم فایل پیوست نباید بیشتر از ۵ مگابایت باشد." },
        { status: 413 },
      );
    }
  }

  const urgentMultiplier = input.urgent ? 1.3 : 1;
  const estimatedPrice = Math.round(service.price * input.quantity * urgentMultiplier);

  let trackingCode = generateTrackingCode();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.trackingCode, trackingCode))
      .limit(1);
    if (existing.length === 0) break;
    trackingCode = generateTrackingCode();
  }

  try {
    const [created] = await db
      .insert(orders)
      .values({
        trackingCode,
        categorySlug: category.slug,
        categoryTitle: category.title,
        serviceSlug: service.slug,
        serviceTitle: service.title,
        fullName: input.fullName,
        phone: input.phone.replace(/^0?9/, "09"),
        email: input.email || null,
        description: input.description,
        quantity: input.quantity,
        urgent: input.urgent,
        estimatedPrice,
        attachmentName: input.attachment?.name ?? null,
        attachmentMime: input.attachment?.mime ?? null,
        attachmentData: input.attachment?.data ?? null,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ ok: true, order: sanitize(created) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create order", error);
    return NextResponse.json({ ok: false, error: "ثبت سفارش با خطا مواجه شد." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const all = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return NextResponse.json({ ok: true, orders: all.map(sanitize) });
}

function sanitize<T extends { attachmentData: string | null }>(order: T) {
  return { ...order, attachmentData: order.attachmentData ? true : null };
}
