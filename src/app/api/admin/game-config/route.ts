export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { gameConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
    const rows = await db.select().from(gameConfig);
    return NextResponse.json({ config: rows });
  } catch (error) {
    console.error("Game config error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "فقط مدیر کل می‌تواند تنظیمات بازی را تغییر دهد" }, { status: 403 });
    }
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ error: "کلید الزامی است" }, { status: 400 });

    const existing = await db.select().from(gameConfig).where(eq(gameConfig.key, key)).limit(1).then((r) => r[0]);
    if (existing) {
      await db.update(gameConfig).set({ value, updatedAt: new Date() }).where(eq(gameConfig.key, key));
    } else {
      await db.insert(gameConfig).values({ key, value, updatedAt: new Date() });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save game config error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
    const { key } = await req.json();
    if (!key) return NextResponse.json({ error: "کلید الزامی است" }, { status: 400 });
    await db.delete(gameConfig).where(eq(gameConfig.key, key));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete game config error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}
