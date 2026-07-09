import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type = "ORDERS", format = "CSV" } = await req.json();

  // In production: generate real PDF/Excel using libraries
  const exportId = nanoid(12);
  const fileUrl = `/exports/${exportId}.${format.toLowerCase()}`;

  return NextResponse.json({
    success: true,
    exportId,
    fileUrl,
    message: `گزارش ${type} با فرمت ${format} آماده دانلود است`,
  });
}