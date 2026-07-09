import { NextRequest, NextResponse } from "next/server";
import { autoCancelStaleOrders } from "@/lib/auto-cancel";

export async function POST(req: NextRequest) {
  // This endpoint can be called by Cloudflare Cron or manually
  const result = await autoCancelStaleOrders(72);
  return NextResponse.json(result);
}