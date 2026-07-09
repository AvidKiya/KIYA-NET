export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  siteSettings,
  themeSettings,
  menuItems,
  aboutContent,
  businessNetwork,
  serviceCategories,
  services,
  contentEditLogs,
} from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { v4 as uuid } from "uuid";

type CMSTable =
  | "site_settings"
  | "theme_settings"
  | "menu_items"
  | "about_content"
  | "business_network"
  | "service_categories"
  | "services";

const TABLE_CONFIG: Record<
  CMSTable,
  {
    pk: string;
    autoId?: boolean;
    schema: any;
  }
> = {
  site_settings: { pk: "key", schema: siteSettings },
  theme_settings: { pk: "key", schema: themeSettings },
  menu_items: { pk: "id", autoId: true, schema: menuItems },
  about_content: { pk: "key", schema: aboutContent },
  business_network: { pk: "id", autoId: true, schema: businessNetwork },
  service_categories: { pk: "id", schema: serviceCategories },
  services: { pk: "id", schema: services },
};

export async function GET() {
  try {
    const [
      siteSettingsRows,
      themeSettingsRows,
      menuItemsRows,
      aboutContentRows,
      businessNetworkRows,
      serviceCategoriesRows,
      servicesRows,
    ] = await Promise.all([
      db.select().from(siteSettings),
      db.select().from(themeSettings),
      db.select().from(menuItems),
      db.select().from(aboutContent),
      db.select().from(businessNetwork),
      db.select().from(serviceCategories),
      db.select().from(services),
    ]);

    return NextResponse.json({
      siteSettings: siteSettingsRows,
      themeSettings: themeSettingsRows,
      menuItems: menuItemsRows,
      aboutContent: aboutContentRows,
      businessNetwork: businessNetworkRows,
      serviceCategories: serviceCategoriesRows,
      services: servicesRows,
    });
  } catch (error) {
    console.error("CMS load error:", error);
    return NextResponse.json({ error: "خطا در بارگذاری محتوا" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "فقط مدیر کل می‌تواند محتوا را ویرایش کند" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, table, data, oldValue, recordId } = body as {
      action: "upsert" | "delete" | "reorder";
      table: CMSTable;
      data?: any;
      oldValue?: any;
      recordId?: string | number;
    };

    const config = TABLE_CONFIG[table];
    if (!config) {
      return NextResponse.json({ error: "جدول نامعتبر" }, { status: 400 });
    }

    const pk = config.pk;
    const id = recordId ?? (data && data[pk]);

    if (action === "delete") {
      if (id === undefined || id === null) {
        return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 });
      }
      const old = await db
        .select()
        .from(config.schema)
        .where(eq(config.schema[pk as keyof typeof config.schema], id as any))
        .limit(1)
        .then((r) => r[0] || null);

      await db
        .delete(config.schema)
        .where(eq(config.schema[pk as keyof typeof config.schema], id as any));

      await logEdit({
        table,
        recordId: String(id),
        oldValue: old,
        newValue: null,
        editedBy: session.userId,
      });

      return NextResponse.json({ success: true, deleted: true });
    }

    if (action === "upsert") {
      if (!data || typeof data !== "object") {
        return NextResponse.json({ error: "داده نامعتبر" }, { status: 400 });
      }

      let existing: any = null;
      if (id !== undefined && id !== null && id !== "") {
        existing = await db
          .select()
          .from(config.schema)
          .where(eq(config.schema[pk as keyof typeof config.schema], id as any))
          .limit(1)
          .then((r) => r[0] || null);
      }

      const now = new Date();
      const insertData = { ...data, updatedAt: now };

      let result: any;
      if (existing) {
        // For key-based tables, don't overwrite the primary key
        const { [pk]: _removed, ...updateData } = insertData;
        await db
          .update(config.schema)
          .set(updateData)
          .where(eq(config.schema[pk as keyof typeof config.schema], id as any));
        result = { ...existing, ...updateData };
      } else {
        if (config.autoId && !insertData[pk]) {
          delete insertData[pk];
        }
        if (table === "services" && !insertData.id) {
          const maxRow = await db
            .select({ maxId: sql<number>`MAX(${services.id})`.as("maxId") })
            .from(services)
            .then((r) => r[0]);
          insertData.id = (maxRow?.maxId || 0) + 1;
        }
        const created = await db
          .insert(config.schema)
          .values(insertData)
          .returning() as any[];
        result = created[0];
      }

      await logEdit({
        table,
        recordId: String(result[pk]),
        oldValue: existing || oldValue || null,
        newValue: result,
        editedBy: session.userId,
      });

      return NextResponse.json({ success: true, [table]: result });
    }

    if (action === "reorder") {
      if (!Array.isArray(data)) {
        return NextResponse.json({ error: "داده نامعتبر" }, { status: 400 });
      }
      for (const item of data) {
        if (!item[pk] || item.sortOrder === undefined) continue;
        await db
          .update(config.schema)
          .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
          .where(eq(config.schema[pk as keyof typeof config.schema], item[pk] as any));
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "اکشن نامعتبر" }, { status: 400 });
  } catch (error) {
    console.error("CMS save error:", error);
    return NextResponse.json({ error: "خطا در ذخیره محتوا" }, { status: 500 });
  }
}

async function logEdit({
  table,
  recordId,
  oldValue,
  newValue,
  editedBy,
}: {
  table: CMSTable;
  recordId: string;
  oldValue: any;
  newValue: any;
  editedBy: string;
}) {
  try {
    await db.insert(contentEditLogs).values({
      id: uuid(),
      settingKey: `${table}.${recordId}`,
      tableName: table,
      recordId: String(recordId),
      oldValue,
      newValue,
      editedBy,
      editedAt: new Date(),
    });
  } catch (err) {
    console.error("CMS log error:", err);
  }
}
