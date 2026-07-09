import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services, serviceCategories } from "@/db/schema";
import { like, or, and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") || "newest";

  let query = db
    .select({
      id: services.id,
      serviceName: services.serviceName,
      description: services.description,
      kiyanetPrice: services.kiyanetPrice,
      categoryId: services.categoryId,
      categoryName: serviceCategories.name,
      estimatedTimeText: services.estimatedTimeText,
    })
    .from(services)
    .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
    .where(eq(services.isActive, true));

  // Search
  if (q) {
    query = query.where(
      or(
        like(services.serviceName, `%${q}%`),
        like(services.description, `%${q}%`)
      )
    );
  }

  // Category filter
  if (category) {
    query = query.where(eq(services.categoryId, category));
  }

  // Price filters
  if (minPrice) {
    query = query.where(services.kiyanetPrice >= parseFloat(minPrice));
  }
  if (maxPrice) {
    query = query.where(services.kiyanetPrice <= parseFloat(maxPrice));
  }

  // Sorting
  if (sort === "price-low") {
    query = query.orderBy(services.kiyanetPrice);
  } else if (sort === "price-high") {
    query = query.orderBy(services.kiyanetPrice, "desc");
  } else {
    query = query.orderBy(services.createdAt, "desc");
  }

  const results = await query.limit(50);
  return NextResponse.json({ results });
}