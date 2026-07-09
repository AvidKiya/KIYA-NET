export const runtime = "edge";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { contentEditLogs, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "OPERATOR" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const logs = await db
      .select({
        id: contentEditLogs.id,
        settingKey: contentEditLogs.settingKey,
        tableName: contentEditLogs.tableName,
        recordId: contentEditLogs.recordId,
        oldValue: contentEditLogs.oldValue,
        newValue: contentEditLogs.newValue,
        editedAt: contentEditLogs.editedAt,
        editedBy: contentEditLogs.editedBy,
        editorName: users.firstName,
      })
      .from(contentEditLogs)
      .leftJoin(users, eq(contentEditLogs.editedBy, users.id))
      .orderBy(desc(contentEditLogs.editedAt))
      .limit(200);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("CMS logs error:", error);
    return NextResponse.json({ error: "خطا در بارگذاری لاگ‌ها" }, { status: 500 });
  }
}
