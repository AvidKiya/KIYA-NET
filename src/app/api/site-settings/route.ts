export const runtime = "edge";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

export async function GET() {
  try {
    const rows = await db.select({ key: siteSettings.key, value: siteSettings.value }).from(siteSettings);
    const settings: Record<string, any> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Site settings error:", error);
    return NextResponse.json({ settings: {} });
  }
}
