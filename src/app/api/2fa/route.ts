import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { enable2FA, verify2FA, disable2FA } from "@/lib/2fa";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, code } = await req.json();

  if (action === "enable") {
    const result = await enable2FA(user.userId);
    return NextResponse.json(result);
  }

  if (action === "verify") {
    const valid = await verify2FA(user.userId, code);
    return NextResponse.json({ valid });
  }

  if (action === "disable") {
    await disable2FA(user.userId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}