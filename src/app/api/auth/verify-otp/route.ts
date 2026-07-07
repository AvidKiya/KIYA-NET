import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, otpCodes } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { createToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, code } = await req.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: "شماره موبایل و کد تایید الزامی است" },
        { status: 400 }
      );
    }

    // Find latest unused OTP
    const otpRecords = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phoneNumber, phoneNumber),
          eq(otpCodes.used, false)
        )
      )
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (otpRecords.length === 0) {
      return NextResponse.json(
        { error: "کد تایید یافت نشد. لطفاً مجدداً درخواست کنید" },
        { status: 400 }
      );
    }

    const otpRecord = otpRecords[0];

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { error: "کد تایید منقضی شده است. لطفاً مجدداً درخواست کنید" },
        { status: 400 }
      );
    }

    if (otpRecord.code !== code) {
      return NextResponse.json(
        { error: "کد تایید اشتباه است" },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await db
      .update(otpCodes)
      .set({ used: true })
      .where(eq(otpCodes.id, otpRecord.id));

    // Find or create user
    let user = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      const userId = uuid();
      const referralCode = `KIYA${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await db.insert(users).values({
        id: userId,
        phoneNumber,
        role: "CUSTOMER",
        walletBalance: "0",
        referralCode,
      });

      user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .then((rows) => rows[0]);
    }

    if (!user) {
      return NextResponse.json(
        { error: "خطا در ایجاد حساب کاربری" },
        { status: 500 }
      );
    }

    // Create JWT token
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
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { error: "خطا در تایید کد" },
      { status: 500 }
    );
  }
}
