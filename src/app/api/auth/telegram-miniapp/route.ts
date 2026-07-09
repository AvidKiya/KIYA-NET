export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { buildMiniAppSession } from "@/lib/bot/engine";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();

    if (!initData || typeof initData !== "string") {
      return NextResponse.json(
        { error: "initData الزامی است" },
        { status: 400 }
      );
    }

    const { token, user } = await buildMiniAppSession("telegram", initData);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      token,
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
    const message = error instanceof Error ? error.message : "خطا در ورود به Mini App";
    console.error("Telegram MiniApp auth error:", error);
    return NextResponse.json(
      { error: message },
      { status: 401 }
    );
  }
}
