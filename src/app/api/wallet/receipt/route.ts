export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cardToCardReceipts, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from "nanoid";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

    const formData = await req.formData();
    const amount = formData.get("amount");
    const file = formData.get("receipt") as File | null;
    const orderId = formData.get("orderId") as string | null;

    if (!amount || Number(amount) < 1000) {
      return NextResponse.json({ error: "حداقل مبلغ ۱۰۰۰ تومان است" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "رسید الزامی است" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "حجم فایل نباید بیشتر از ۵ مگابایت باشد" }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.id, session.userId)).limit(1).then((r) => r[0]);
    if (!user) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(bytes);
    const dataUrl = `data:${file.type || "image/jpeg"};base64,${base64}`;

    const id = nanoid();
    await db.insert(cardToCardReceipts).values({
      id,
      userId: user.id,
      orderId: orderId,
      amount: String(amount),
      receiptUrl: dataUrl,
      status: "PENDING",
    });

    return NextResponse.json({
      success: true,
      receiptId: id,
      message: "رسید ارسال شد. پس از تأیید ادمین، موجودی شما شارژ می‌شود.",
    });
  } catch (error) {
    console.error("Receipt upload error:", error);
    return NextResponse.json({ error: "خطا در ارسال رسید" }, { status: 500 });
  }
}
