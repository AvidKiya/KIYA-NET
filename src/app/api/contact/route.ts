import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { contactSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بدنه درخواست نامعتبر است." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "اطلاعات ارسالی نامعتبر است.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const input = parsed.data;
  try {
    await db.insert(contactMessages).values({
      name: input.name,
      phone: input.phone,
      message: input.message,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Contact message error", error);
    return NextResponse.json({ ok: false, error: "ارسال پیام با خطا مواجه شد." }, { status: 500 });
  }
}
