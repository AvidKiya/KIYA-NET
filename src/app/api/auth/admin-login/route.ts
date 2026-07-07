import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createToken, setSessionCookie } from "@/lib/auth";

export const runtime = "edge";
const DEFAULT_PASSWORD = "AvidKiya*2397*7370#";

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, password } = await req.json();

    if (!phoneNumber || !password) {
      return NextResponse.json({ error: "شماره موبایل و رمز عبور الزامی است" }, { status: 400 });
    }

    // Find user
    const user = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1).then(r => r[0]);

    if (!user) {
      return NextResponse.json({ error: "کاربری با این شماره یافت نشد" }, { status: 404 });
    }

    if (user.role !== "OPERATOR" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    // Check password
    // For now: if no password set, use default. In production, passwords would be hashed in DB.
    const storedPassword = (user as any).adminPassword;
    const validPassword = storedPassword || DEFAULT_PASSWORD;

    if (password !== validPassword) {
      return NextResponse.json({ error: "رمز عبور اشتباه است" }, { status: 401 });
    }

    const needsPasswordChange = !storedPassword;

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
      },
      needsPasswordChange,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "خطا در ورود" }, { status: 500 });
  }
}
