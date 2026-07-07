import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, otpCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export const runtime = "edge";
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || !/^09\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Expire in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.insert(otpCodes).values({
      id: uuid(),
      phoneNumber,
      code,
      expiresAt,
    });

    // In production, send via SMS or Telegram bot
    // For development, we return the code directly
    console.log(`[OTP] ${phoneNumber}: ${code}`);

    return NextResponse.json({
      success: true,
      message: "کد تایید ارسال شد",
      // ONLY in development:
      ...(process.env.NODE_ENV !== "production" && { code }),
    });
  } catch (error) {
    console.error("OTP request error:", error);
    return NextResponse.json(
      { error: "خطا در ارسال کد تایید" },
      { status: 500 }
    );
  }
}
