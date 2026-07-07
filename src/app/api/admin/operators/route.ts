export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const ops = await db.select().from(users).where(eq(users.role, "OPERATOR"));
    return NextResponse.json({ operators: ops });
  } catch (error) {
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "فقط مدیر کل می‌تواند اپراتور اضافه کند" }, { status: 403 });
    }

    const { phoneNumber, modules, commission } = await req.json();

    if (!phoneNumber || !/^09\d{9}$/.test(phoneNumber)) {
      return NextResponse.json({ error: "شماره معتبر نیست" }, { status: 400 });
    }

    // Check if already exists
    const existing = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1).then(r => r[0]);
    if (existing) {
      // Upgrade to operator
      await db.update(users).set({
        role: "OPERATOR" as any,
        assignedModules: modules || [],
        updatedAt: new Date(),
      } as any).where(eq(users.id, existing.id));
      return NextResponse.json({ success: true, message: "کاربر به اپراتور ارتقا یافت" });
    }

    const id = uuid();
    await db.insert(users).values({
      id,
      phoneNumber,
      role: "OPERATOR" as any,
      assignedModules: modules || [],
      walletBalance: "0",
      referralCode: "KIYA" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    } as any);

    return NextResponse.json({ success: true, message: "اپراتور جدید ایجاد شد" });
  } catch (error) {
    console.error("Add operator error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}
