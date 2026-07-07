import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("avid_order_status", [
  "pending",
  "accepted",
  "completed",
  "delivered",
  "cancelled",
]);

export const orders = pgTable("avid_orders", {
  id: serial("id").primaryKey(),
  trackingCode: varchar("tracking_code", { length: 24 }).notNull().unique(),
  categorySlug: varchar("category_slug", { length: 100 }).notNull(),
  categoryTitle: varchar("category_title", { length: 200 }).notNull(),
  serviceSlug: varchar("service_slug", { length: 100 }).notNull(),
  serviceTitle: varchar("service_title", { length: 200 }).notNull(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 150 }),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  urgent: boolean("urgent").notNull().default(false),
  estimatedPrice: integer("estimated_price").notNull().default(0),
  attachmentName: varchar("attachment_name", { length: 255 }),
  attachmentMime: varchar("attachment_mime", { length: 100 }),
  attachmentData: text("attachment_data"),
  status: orderStatusEnum("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
