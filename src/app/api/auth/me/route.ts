import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";
export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nationalId: user.nationalId,
        role: user.role,
        walletBalance: user.walletBalance,
        telegramChatId: user.telegramChatId,
        baleChatId: user.baleChatId,
        referralCode: user.referralCode,
        assignedModules: user.assignedModules,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
