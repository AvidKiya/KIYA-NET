export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createToken, setSessionCookie, comparePassword } from "@/lib/auth";

const getDefaultPasswordForRole = (role: string) => {
  if (role === "SUPER_ADMIN") {
    return process.env.SUPER_ADMIN_PASSWORDS || "";
  }
  if (role === "OPERATOR") {
    return process.env.OPERATOR_ADMIN_PASSWORDS || "";
  }
  return "";
};

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, password } = await req.json();

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: "شماره موبایل و رمز عبور الزامی است" },
        { status: 400 }
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1)
      .then((r) => r[0]);

    if (!user) {
      return NextResponse.json(
        { error: "کاربری با این شماره یافت نشد" },
        { status: 404 }
      );
    }

    if (user.role !== "OPERATOR" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    let isValidPassword = false;
    let needsPasswordChange = false;

    if (user.passwordHash) {
      isValidPassword = await comparePassword(password, user.passwordHash);
    } else {
      // First time login with env-based default password
      const envPassword = getDefaultPasswordForRole(user.role);
      if (envPassword && password === envPassword) {
        isValidPassword = true;
        needsPasswordChange = true;
      }
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    const token = await createToken({
      userId: user.id,
      role: user.role,
      phoneNumber: user.phoneNumber,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        assignedModules: user.assignedModules,
        permissions: user.permissions,
        commissionRate: user.commissionRate,
      },
      needsPasswordChange: needsPasswordChange || user.mustChangePassword,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "خطا در ورود" },
      { status: 500 }
    );
  }
}
