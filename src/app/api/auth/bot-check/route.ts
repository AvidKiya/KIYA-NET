import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ success: false, error: "شماره موبایل الزامی است" }, { status: 400 });
    }

    // Check if there's a recent OTP for this phone (bot would create it)
    const records = await db
      .select()
      .from(otpCodes)
      .where(and(eq(otpCodes.phoneNumber, phone), eq(otpCodes.used, false)))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (records.length === 0) {
      return NextResponse.json({ success: false });
    }

    const record = records[0];

    if (new Date() > record.expiresAt) {
      return NextResponse.json({ success: false, error: "کد منقضی شده" });
    }

    // Return the code (in production, the bot would deliver this via Telegram/Bale)
    return NextResponse.json({ success: true, code: record.code });
  } catch (error) {
    console.error("Bot check error:", error);
    return NextResponse.json({ success: false, error: "خطا" }, { status: 500 });
  }
}
