export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setWebhookUrl, type BotPlatform } from "@/lib/bot/engine";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "فقط مدیر کل می‌تواند webhook را تنظیم کند" },
        { status: 403 }
      );
    }

    const { platform, publicUrl } = await req.json();

    if (!platform || (platform !== "telegram" && platform !== "bale")) {
      return NextResponse.json(
        { error: "پلتفرم باید telegram یا bale باشد" },
        { status: 400 }
      );
    }

    if (!publicUrl || typeof publicUrl !== "string" || !publicUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "آدرس عمومی سایت باید با https:// شروع شود" },
        { status: 400 }
      );
    }

    const result = await setWebhookUrl(platform as BotPlatform, publicUrl);

    return NextResponse.json({
      success: true,
      webhookUrl: result.webhookUrl,
      message: `Webhook ${platform === "telegram" ? "تلگرام" : "بله"} با موفقیت تنظیم شد.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطا در تنظیم webhook";
    console.error("Setup webhook error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
