import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { nanoid } from "nanoid";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const body = await req.json();
  const { action, entityType, entityId, oldValue, newValue } = body;

  await db.insert(auditLogs).values({
    id: nanoid(12),
    userId: user?.id || null,
    action,
    entityType,
    entityId: entityId || null,
    oldValue: oldValue || null,
    newValue: newValue || null,
    ipAddress: req.headers.get("x-forwarded-for") || "unknown",
    userAgent: req.headers.get("user-agent") || "unknown",
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const logs = await db
    .select()
    .from(auditLogs)
    .orderBy(auditLogs.createdAt)
    .limit(100);

  return NextResponse.json({ logs });
}