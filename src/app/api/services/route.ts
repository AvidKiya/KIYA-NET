export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services, serviceCategories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    let conditions = [];
    if (categoryId) {
      conditions.push(eq(services.categoryId, categoryId));
    }

    const data = await db
      .select({
        id: services.id,
        categoryId: services.categoryId,
        serviceName: services.serviceName,
        officialPrice: services.officialPrice,
        kiyanetPrice: services.kiyanetPrice,
        estimatedTimeMinutes: services.estimatedTimeMinutes,
        estimatedTimeText: services.estimatedTimeText,
        requiredDocuments: services.requiredDocuments,
        isActive: services.isActive,
        requiresPhysicalShipping: services.requiresPhysicalShipping,
        categoryName: serviceCategories.name,
        categoryIcon: serviceCategories.iconName,
        categoryColor: serviceCategories.color,
      })
      .from(services)
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .where(and(...conditions, eq(services.isActive, true)));

    return NextResponse.json({ services: data });
  } catch (error) {
    console.error("Services error:", error);
    return NextResponse.json({ error: "خطا در بارگذاری خدمات" }, { status: 500 });
  }
}
