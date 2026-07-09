export const runtime = "edge";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsFeeds } from "@/db/schema";
import { eq } from "drizzle-orm";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category: string;
}

function parseRSS(xml: string, source: string, category: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const description = extractTag(itemXml, "description").replace(/<[^>]+>/g, "").substring(0, 200);
    const pubDate = extractTag(itemXml, "pubDate");
    if (title && link) {
      items.push({ title, link, description, pubDate, source, category });
    }
  }
  return items;
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, "s");
  const match = regex.exec(xml);
  return match ? match[1].trim() : "";
}

export async function GET() {
  try {
    const feeds = await db
      .select()
      .from(newsFeeds)
      .where(eq(newsFeeds.isActive, true));

    const allItems: NewsItem[] = [];
    for (const feed of feeds) {
      try {
        const res = await fetch(feed.rssUrl, { headers: { "User-Agent": "KIYA-NET News Reader" } });
        if (!res.ok) continue;
        const xml = await res.text();
        const items = parseRSS(xml, feed.sourceName, feed.category);
        allItems.push(...items.slice(0, 10));
      } catch (err) {
        console.error(`RSS fetch error for ${feed.sourceName}:`, err);
      }
    }

    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return NextResponse.json({
      success: true,
      items: allItems.slice(0, 30),
      count: allItems.length,
    });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json({ success: false, items: [], error: "خطا در بارگذاری اخبار" }, { status: 500 });
  }
}
