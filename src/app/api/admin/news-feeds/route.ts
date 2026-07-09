export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { newsFeeds } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
    const rows = await db.select().from(newsFeeds);
    return NextResponse.json({ feeds: rows });
  } catch (error) {
    console.error("News feeds error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "فقط مدیر کل می‌تواند منابع RSS را مدیریت کند" }, { status: 403 });
    }
    const { sourceName, rssUrl, category } = await req.json();
    if (!sourceName || !rssUrl || !category) {
      return NextResponse.json({ error: "همه فیلدها الزامی است" }, { status: 400 });
    }
    const [created] = await db
      .insert(newsFeeds)
      .values({ sourceName, rssUrl, category })
      .returning();
    return NextResponse.json({ success: true, feed: created });
  } catch (error) {
    console.error("Add news feed error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "فقط مدیر کل می‌تواند منابع RSS را حذف کند" }, { status: 403 });
    }
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 });
    await db.delete(newsFeeds).where(eq(newsFeeds.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete news feed error:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}
