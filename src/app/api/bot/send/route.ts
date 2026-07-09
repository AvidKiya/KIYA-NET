export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sendBotMessage, type BotPlatform } from "@/lib/bot/engine";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const { platform, chatId, message } = await req.json();

    if (!platform || (platform !== "telegram" && platform !== "bale")) {
      return NextResponse.json(
        { error: "پلتفرم باید telegram یا bale باشد" },
        { status: 400 }
      );
    }

    if (!chatId || typeof chatId !== "string") {
      return NextResponse.json(
        { error: "شناسه چت الزامی است" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.length === 0) {
      return NextResponse.json(
        { error: "متن پیام الزامی است" },
        { status: 400 }
      );
    }

    const result = await sendBotMessage(platform as BotPlatform, chatId, message);

    return NextResponse.json({
      success: true,
      messageId: result.message_id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطا در ارسال پیام";
    console.error("Bot send error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
