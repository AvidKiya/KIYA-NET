import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLoyaltyStatus, awardPoints } from "@/lib/loyalty";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = await getLoyaltyStatus(user.id);
  return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { points, description, orderId } = await req.json();
  if (!points || !description) {
    return NextResponse.json({ error: "points and description required" }, { status: 400 });
  }

  const result = await awardPoints(user.id, points, description, orderId);
  return NextResponse.json(result);
}