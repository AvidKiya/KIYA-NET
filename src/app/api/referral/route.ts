import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createReferral, getReferralCode, completeReferral } from "@/lib/referral";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const code = await getReferralCode(user.id);
  return NextResponse.json({ referralCode: code });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { referredId } = await req.json();
  if (!referredId) return NextResponse.json({ error: "referredId required" }, { status: 400 });

  const result = await createReferral(user.id, referredId);
  if (!result) return NextResponse.json({ error: "Referral already exists or invalid" }, { status: 400 });

  return NextResponse.json(result);
}