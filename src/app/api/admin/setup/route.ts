export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings, siteSettings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { v4 as uuid } from "uuid";

const DEFAULT_ADMIN_PHONE = "0690901038";
const DEFAULT_ADMIN_PASSWORD = "AvidKiya*2397*7370#";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      databaseUrl,
      r2AccessKey,
      r2SecretKey,
      r2Endpoint,
      r2Bucket,
      telegramBotToken,
      baleBotToken,
      zarrinpalMerchant,
      kavenegarApiKey,
    } = body;

    // Validate database connection by running a simple query
    try {
      await db.select().from(users).limit(1);
    } catch (dbError) {
      console.error("Database connection test failed:", dbError);
      return NextResponse.json(
        { error: "اتصال به دیتابیس برقرار نشد. DATABASE_URL را بررسی کنید." },
        { status: 400 }
      );
    }

    // Save or update system settings
    const settingsToSave = [
      { key: "DATABASE_URL", value: databaseUrl || "", isConfigured: Boolean(databaseUrl) },
      { key: "R2_ACCESS_KEY", value: r2AccessKey || "", isConfigured: Boolean(r2AccessKey) },
      { key: "R2_SECRET_KEY", value: r2SecretKey || "", isConfigured: Boolean(r2SecretKey) },
      { key: "R2_ENDPOINT", value: r2Endpoint || "", isConfigured: Boolean(r2Endpoint) },
      { key: "R2_BUCKET", value: r2Bucket || "", isConfigured: Boolean(r2Bucket) },
      { key: "TELEGRAM_BOT_TOKEN", value: telegramBotToken || "", isConfigured: Boolean(telegramBotToken) },
      { key: "BALE_BOT_TOKEN", value: baleBotToken || "", isConfigured: Boolean(baleBotToken) },
      { key: "ZARRINPAL_MERCHANT", value: zarrinpalMerchant || "", isConfigured: Boolean(zarrinpalMerchant) },
      { key: "KAVENEGAR_API_KEY", value: kavenegarApiKey || "", isConfigured: Boolean(kavenegarApiKey) },
      { key: "SETUP_COMPLETE", value: "true", isConfigured: true },
    ];

    for (const setting of settingsToSave) {
      const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, setting.key)).limit(1).then((r) => r[0]);
      if (existing) {
        await db.update(systemSettings).set({ value: setting.value, isConfigured: setting.isConfigured, updatedAt: new Date() }).where(eq(systemSettings.key, setting.key));
      } else {
        await db.insert(systemSettings).values({ ...setting, updatedAt: new Date() });
      }
    }

    // Ensure admin user exists
    const existingAdmin = await db.select().from(users).where(eq(users.phoneNumber, DEFAULT_ADMIN_PHONE)).limit(1).then((r) => r[0]);

    if (!existingAdmin) {
      const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
      await db.insert(users).values({
        id: uuid(),
        phoneNumber: DEFAULT_ADMIN_PHONE,
        firstName: "مدیر",
        lastName: "کل",
        role: "SUPER_ADMIN",
        walletBalance: "0",
        passwordHash,
        mustChangePassword: true,
        commissionRate: "0",
        isActive: true,
      });
    }

    // Ensure site settings exist
    const siteSettingsKeys = [
      { key: "site_name", value: "کیا نت" },
      { key: "site_tagline", value: "کافی‌نتی که هیچ‌وقت درش بسته نمی‌شه" },
      { key: "hero_title", value: "میز کار خود را انتخاب کنید" },
      { key: "express_surcharge_percent", value: "30" },
      { key: "default_commission_rate", value: "35" },
      { key: "payout_day", value: "THURSDAY" },
      { key: "payout_start_hour", value: "15" },
      { key: "payout_end_hour", value: "21" },
      { key: "bank_card_number", value: "6219861918693416" },
      { key: "bank_card_holder", value: "رسول محمدی کیا" },
      { key: "bank_name", value: "سامان / بلو بانک" },
    ];

    for (const setting of siteSettingsKeys) {
      const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, setting.key)).limit(1).then((r) => r[0]);
      if (!existing) {
        await db.insert(siteSettings).values({ ...setting, updatedAt: new Date() });
      }
    }

    return NextResponse.json({
      success: true,
      message: "تنظیمات با موفقیت ذخیره شد. می‌توانید وارد شوید.",
      adminPhone: DEFAULT_ADMIN_PHONE,
      adminDefaultPassword: DEFAULT_ADMIN_PASSWORD,
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "خطا در ذخیره تنظیمات" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const setupComplete = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "SETUP_COMPLETE"))
      .limit(1)
      .then((r) => r[0]);

    return NextResponse.json({
      isSetupComplete: setupComplete?.value === "true" || setupComplete?.isConfigured === true,
    });
  } catch (error) {
    console.error("Setup check error:", error);
    return NextResponse.json({ isSetupComplete: false });
  }
}
