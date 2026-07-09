export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getBaleBot } from "@/lib/bot/bale";

export async function POST(req: NextRequest) {
  try {
    const bot = await getBaleBot();
    if (!bot) {
      return NextResponse.json(
        { error: "ربات بله پیکربندی نشده است" },
        { status: 400 }
      );
    }

    const update = await req.json();
    await bot.handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bale webhook error:", error);
    return NextResponse.json(
      { error: "خطا در پردازش webhook" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, platform: "bale" });
}
