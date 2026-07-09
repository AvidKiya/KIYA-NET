export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const ops = await db
      .select()
      .from(users)
      .where(eq(users.role, "OPERATOR"));

    return NextResponse.json({ operators: ops });
  } catch (error) {
    console.error("Get operators error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "فقط مدیر کل می‌تواند اپراتور اضافه کند" },
        { status: 403 }
      );
    }

    const { phoneNumber, modules, commission, permissions } = await req.json();

    // Validate Iranian mobile number (starts with 09 or 06, 11 digits total)
    if (!phoneNumber || !/^0\d{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست. فرمت: ۰۹۱۲۳۴۵۶۷۸۹ یا ۰۶۹۰۹۰۱۰۳۸" },
        { status: 400 }
      );
    }

    const commissionRate = typeof commission === "number" ? String(commission) : commission || "10";

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1)
      .then((r) => r[0]);

    if (existing) {
      if (existing.role === "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "نمی‌توان نقش مدیر کل را به اپراتور تغییر داد" },
          { status: 400 }
        );
      }

      await db
        .update(users)
        .set({
          role: "OPERATOR",
          assignedModules: modules || [],
          permissions: permissions || {},
          commissionRate,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id));

      return NextResponse.json({
        success: true,
        message: "کاربر به اپراتور ارتقا یافت",
        operatorId: existing.id,
      });
    }

    const id = uuid();
    // passwordHash is null so the env-based OPERATOR_ADMIN_PASSWORDS is used on first login.
    await db.insert(users).values({
      id,
      phoneNumber,
      role: "OPERATOR",
      assignedModules: modules || [],
      permissions: permissions || {},
      commissionRate,
      walletBalance: "0",
      passwordHash: null,
      mustChangePassword: true,
      referralCode: "KIYA" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: "اپراتور جدید ایجاد شد",
      operatorId: id,
    });
  } catch (error) {
    console.error("Add operator error:", error);
    return NextResponse.json({ error: "خطا در ایجاد اپراتور" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!existing) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    if (existing.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "نمی‌توان مدیر کل را حذف کرد" }, { status: 400 });
    }

    await db
      .update(users)
      .set({ role: "CUSTOMER", assignedModules: [], commissionRate: "0", updatedAt: new Date() })
      .where(eq(users.id, id));

    return NextResponse.json({ success: true, message: "دسترسی اپراتور حذف شد" });
  } catch (error) {
    console.error("Delete operator error:", error);
    return NextResponse.json({ error: "خطا در حذف اپراتور" }, { status: 500 });
  }
}
