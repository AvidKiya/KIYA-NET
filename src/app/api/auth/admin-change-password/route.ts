export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, comparePassword, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "رمز جدید باید حداقل ۸ کاراکتر باشد" },
        { status: 400 }
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)
      .then((r) => r[0]);

    if (!user) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    const envPassword = user.role === "SUPER_ADMIN"
      ? process.env.SUPER_ADMIN_PASSWORDS
      : user.role === "OPERATOR"
      ? process.env.OPERATOR_ADMIN_PASSWORDS
      : "";
    let currentValid = false;

    if (user.passwordHash) {
      currentValid = await comparePassword(currentPassword, user.passwordHash);
    } else if (envPassword) {
      currentValid = currentPassword === envPassword;
    }

    if (!currentValid) {
      return NextResponse.json(
        { error: "رمز فعلی اشتباه است" },
        { status: 401 }
      );
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db.update(users).set({
      passwordHash: newPasswordHash,
      mustChangePassword: false,
      updatedAt: new Date(),
    }).where(eq(users.id, session.userId));

    return NextResponse.json({
      success: true,
      message: "رمز عبور با موفقیت تغییر کرد",
    });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "خطا در تغییر رمز" },
      { status: 500 }
    );
  }
}
