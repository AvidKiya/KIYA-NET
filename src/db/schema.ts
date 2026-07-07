import {
  pgTable,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ======================== ENUMS ========================

export const userRoleEnum = pgEnum("user_role", [
  "CUSTOMER",
  "OPERATOR",
  "SUPER_ADMIN",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "NATIONAL_CARD_FRONT",
  "NATIONAL_CARD_BACK",
  "ID_BOOK_P1",
  "PORTRAIT",
  "MILITARY_CARD",
  "OTHER",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING_ASSIGNMENT",
  "UNDER_REVIEW",
  "NEEDS_INFO",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PAID",
  "PENDING",
  "REFUNDED",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "WALLET",
  "ONLINE_GATEWAY",
]);

export const messageTypeEnum = pgEnum("message_type", [
  "TEXT",
  "VOICE",
  "IMAGE",
  "FILE",
  "SYSTEM_ALERT",
]);

// ======================== USERS ========================

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    phoneNumber: text("phone_number").unique(),
    email: text("email").unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    nationalId: text("national_id"),
    walletBalance: decimal("wallet_balance", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    telegramChatId: text("telegram_chat_id"),
    baleChatId: text("bale_chat_id"),
    role: userRoleEnum("role").default("CUSTOMER").notNull(),
    assignedModules: jsonb("assigned_modules").$type<string[]>(),
    referralCode: text("referral_code").unique(),
    referredBy: text("referred_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("phone_idx").on(table.phoneNumber),
    uniqueIndex("email_idx").on(table.email),
    index("role_idx").on(table.role),
  ]
);

// ======================== OTP ========================

export const otpCodes = pgTable("otp_codes", {
  id: text("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================== SESSIONS ========================

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================== SYSTEM SETTINGS ========================

export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  isConfigured: boolean("is_configured").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ======================== IDENTITY VAULT ========================

export const identityVaultDocuments = pgTable("identity_vault_documents", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  documentType: documentTypeEnum("document_type").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================== SERVICE CATEGORIES ========================

export const serviceCategories = pgTable("service_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  iconName: text("icon_name").notNull(),
  color: text("color").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// ======================== SERVICES ========================

export const services = pgTable("services", {
  id: integer("id").primaryKey(),
  categoryId: text("category_id")
    .references(() => serviceCategories.id, { onDelete: "cascade" })
    .notNull(),
  serviceName: text("service_name").notNull(),
  officialPrice: decimal("official_price", { precision: 12, scale: 2 }).notNull(),
  kiyanetPrice: decimal("kiyanet_price", { precision: 12, scale: 2 }).notNull(),
  estimatedTimeMinutes: integer("estimated_time_minutes").notNull(),
  estimatedTimeText: text("estimated_time_text"),
  requiredDocuments: jsonb("required_documents").$type<string[]>(),
  isActive: boolean("is_active").default(true).notNull(),
  requiresPhysicalShipping: boolean("requires_physical_shipping").default(false).notNull(),
  sortOrder: integer("sort_order").default(0),
});

// ======================== ORDERS ========================

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    operatorId: text("operator_id").references(() => users.id),
    serviceId: integer("service_id")
      .references(() => services.id)
      .notNull(),
    status: orderStatusEnum("status").default("PENDING_ASSIGNMENT").notNull(),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
    paymentStatus: paymentStatusEnum("payment_status").default("PENDING").notNull(),
    paymentMethod: paymentMethodEnum("payment_method"),
    userNotes: text("user_notes"),
    adminNotes: text("admin_notes"),
    finalOutputFile: text("final_output_file"),
    shippingTrackingCode: text("shipping_tracking_code"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_id_idx").on(table.userId),
    index("operator_id_idx").on(table.operatorId),
    index("status_idx").on(table.status),
  ]
);

// ======================== ORDER CHAT ========================

export const orderChatMessages = pgTable(
  "order_chat_messages",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    senderId: text("sender_id").notNull(),
    messageText: text("message_text"),
    attachmentUrl: text("attachment_url"),
    messageType: messageTypeEnum("message_type").default("TEXT").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("order_chat_idx").on(table.orderId)]
);

// ======================== WALLET TRANSACTIONS ========================

export const walletTransactions = pgTable(
  "wallet_transactions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    type: text("type").notNull(), // CHARGE, PAYMENT, REFUND, REFERRAL_BONUS
    orderId: text("order_id"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("wallet_user_idx").on(table.userId)]
);

// ======================== COUPONS ========================

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  code: text("code").unique().notNull(),
  discountPercent: integer("discount_percent"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0).notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================== CONTACT MESSAGES ========================

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

// ======================== NOTIFICATIONS ========================

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    orderId: text("order_id"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("notif_user_idx").on(table.userId)]
);

// ======================== TYPE EXPORTS ========================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type OtpCode = typeof otpCodes.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type IdentityVaultDocument = typeof identityVaultDocuments.$inferSelect;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderChatMessage = typeof orderChatMessages.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
