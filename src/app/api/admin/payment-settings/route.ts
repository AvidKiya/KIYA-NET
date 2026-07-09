export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

const KEYS = ["PAYMENT_GATEWAY", "ZARRINPAL_MERCHANT", "PAYPING_TOKEN"];

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const rows = await db
      .select({ key: systemSettings.key, value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, "PAYMENT_GATEWAY"));
    // Also fetch others by listing all
    const all = await db
      .select({ key: systemSettings.key, value: systemSettings.value })
      .from(systemSettings);
    const settings: Record<string, string | null> = {};
    for (const k of KEYS) settings[k] = all.find((r) => r.key === k)?.value || "";

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Payment settings error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "فقط مدیر کل می‌تواند تنظیمات پرداخت را تغییر دهد" }, { status: 403 });
    }

    const body = await req.json();
    const { paymentGateway, zarinpalMerchant, paypingToken } = body;

    const values = [
      { key: "PAYMENT_GATEWAY", value: paymentGateway || "test" },
      { key: "ZARRINPAL_MERCHANT", value: zarinpalMerchant || "" },
      { key: "PAYPING_TOKEN", value: paypingToken || "" },
    ];

    for (const item of values) {
      const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, item.key)).limit(1).then((r) => r[0]);
      if (existing) {
        await db
          .update(systemSettings)
          .set({ value: item.value, isConfigured: Boolean(item.value), updatedAt: new Date() })
          .where(eq(systemSettings.key, item.key));
      } else {
        await db.insert(systemSettings).values({ ...item, isConfigured: Boolean(item.value), updatedAt: new Date() });
      }
    }

    return NextResponse.json({ success: true, message: "تنظیمات پرداخت ذخیره شد" });
  } catch (error) {
    console.error("Save payment settings error:", error);
    return NextResponse.json({ error: "خطا در ذخیره تنظیمات" }, { status: 500 });
  }
}
