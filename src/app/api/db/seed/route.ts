import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { users, serviceCategories, services } from "@/db/schema";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const db = getDb();

    // Create admin user
    await db.insert(users).values({
      id: nanoid(12),
      phoneNumber: "0690901038",
      firstName: "آوید",
      lastName: "کیا",
      role: "SUPER_ADMIN",
      walletBalance: "0",
      mustChangePassword: true,
    }).onConflictDoNothing();

    // Seed categories
    const categories = [
      { id: "judicial", name: "امور قضایی و حقوقی", slug: "judicial", iconName: "Gavel", color: "#3b82f6" },
      { id: "university", name: "دانشگاه و آزمون‌ها", slug: "university", iconName: "GraduationCap", color: "#8b5cf6" },
      { id: "tax", name: "مالیات و اصناف", slug: "tax", iconName: "Receipt", color: "#10b981" },
    ];

    for (const cat of categories) {
      await db.insert(serviceCategories).values({
        ...cat,
        description: "",
        tagline: "",
        sortOrder: 0,
        isActive: true,
      }).onConflictDoNothing();
    }

    return NextResponse.json({ success: true, message: "D1 Database seeded successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}