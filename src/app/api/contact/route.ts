import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { contactSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بدنه درخواست نامعتبر است." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  try {
    await db.insert(contactMessages).values(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save contact message", error);
    return NextResponse.json({ ok: false, error: "ارسال پیام با خطا مواجه شد." }, { status: 500 });
  }
}
