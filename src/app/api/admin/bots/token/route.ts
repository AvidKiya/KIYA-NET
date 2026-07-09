export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setBotToken, type BotPlatform } from "@/lib/bot/engine";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "فقط مدیر کل می‌تواند تنظیمات ربات را تغییر دهد" },
        { status: 403 }
      );
    }

    const { platform, token } = await req.json();

    if (!platform || (platform !== "telegram" && platform !== "bale")) {
      return NextResponse.json(
        { error: "پلتفرم باید telegram یا bale باشد" },
        { status: 400 }
      );
    }

    if (!token || typeof token !== "string" || token.length < 10) {
      return NextResponse.json(
        { error: "توکن ربات معتبر نیست" },
        { status: 400 }
      );
    }

    await setBotToken(platform as BotPlatform, token);

    return NextResponse.json({
      success: true,
      message: `توکن ${platform === "telegram" ? "تلگرام" : "بله"} ذخیره شد.`,
    });
  } catch (error) {
    console.error("Save bot token error:", error);
    return NextResponse.json(
      { error: "خطا در ذخیره توکن ربات" },
      { status: 500 }
    );
  }
}
