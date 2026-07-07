import { db } from "@/db";
import {
  users,
  serviceCategories,
  services,
  systemSettings,
} from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding Kiya Net database...");

  // Check if already seeded
  const existing = await db.select().from(serviceCategories).limit(1);
  if (existing.length > 0) {
    console.log("✅ Database already seeded. Skipping.");
    return;
  }

  // ==================== SYSTEM SETTINGS ====================
  await db.insert(systemSettings).values([
    { key: "SITE_NAME", value: "کیا نت", isConfigured: true },
    { key: "SITE_TITLE", value: "Kiya Net | کیا نت", isConfigured: true },
    { key: "SETUP_COMPLETE", value: "true", isConfigured: true },
  ]);

  // ==================== SUPER ADMIN USER ====================
  const adminId = uuidv4();
  await db.insert(users).values({
    id: adminId,
    phoneNumber: "09120000000",
    firstName: "مدیر",
    lastName: "کل",
    role: "SUPER_ADMIN",
    walletBalance: "0",
  });

  // ==================== SERVICE CATEGORIES ====================
  // Add your service categories here

  // ==================== SERVICES ====================
  // Add your services here

  console.log("✅ Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
