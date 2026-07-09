export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getTelegramBot } from "@/lib/bot/telegram";
import { handleBotUpdate } from "@/lib/bot/engine";

export async function POST(req: NextRequest) {
  try {
    const bot = await getTelegramBot();
    if (!bot) {
      return NextResponse.json(
        { error: "ربات تلگرام پیکربندی نشده است" },
        { status: 400 }
      );
    }

    const update = await req.json();
    await handleBotUpdate("telegram", update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json(
      { error: "خطا در پردازش webhook" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, platform: "telegram" });
}
