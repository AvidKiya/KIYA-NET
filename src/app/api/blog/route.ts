import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");

  if (slug) {
    const post = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)))
      .limit(1);
    return NextResponse.json(post[0] || null);
  }

  let query = db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(blogPosts.publishedAt);

  if (category) {
    query = query.where(eq(blogPosts.category, category));
  }

  const posts = await query.limit(20);
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, content, excerpt, category, tags, coverImage } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content required" }, { status: 400 });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, "")
    .replace(/\s+/g, "-");

  const post = await db
    .insert(blogPosts)
    .values({
      id: nanoid(12),
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 150) + "...",
      category: category || "عمومی",
      tags: tags || [],
      coverImage: coverImage || null,
      isPublished: true,
      publishedAt: new Date(),
    })
    .returning();

  return NextResponse.json(post[0]);
}