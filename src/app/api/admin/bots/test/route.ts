export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { testBotToken, type BotPlatform } from "@/lib/bot/engine";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "فقط مدیر کل می‌تواند ربات را تست کند" },
        { status: 403 }
      );
    }

    const { platform } = await req.json();

    if (!platform || (platform !== "telegram" && platform !== "bale")) {
      return NextResponse.json(
        { error: "پلتفرم باید telegram یا bale باشد" },
        { status: 400 }
      );
    }

    const result = await testBotToken(platform as BotPlatform);

    return NextResponse.json({
      success: true,
      bot: result.bot,
      message: `ربات ${platform === "telegram" ? "تلگرام" : "بله"} فعال و پاسخگو است.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطا در تست ربات";
    console.error("Test bot error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
