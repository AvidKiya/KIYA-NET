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
  "CARD_TO_CARD",
]);

export const messageTypeEnum = pgEnum("message_type", [
  "TEXT",
  "VOICE",
  "IMAGE",
  "FILE",
  "SYSTEM_ALERT",
]);

export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const receiptStatusEnum = pgEnum("receipt_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const identifierTypeEnum = pgEnum("identifier_type", [
  "PHONE",
  "TELEGRAM_ID",
  "BALE_ID",
]);

export const menuLocationEnum = pgEnum("menu_location", [
  "HEADER",
  "FOOTER",
  "BOTTOM_NAV",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "PERCENT",
  "FIXED",
]);

export const discountSourceEnum = pgEnum("discount_source", [
  "GAME",
  "CAMPAIGN",
  "MANUAL",
]);

export const walletTransactionTypeEnum = pgEnum("wallet_transaction_type", [
  "CHARGE",
  "PAYMENT",
  "REFUND",
  "REFERRAL_BONUS",
  "COMMISSION",
  "WITHDRAWAL",
  "WITHDRAWAL_REFUND",
]);

export const pendingPaymentTypeEnum = pgEnum("pending_payment_type", [
  "WALLET_CHARGE",
  "ORDER_PAYMENT",
]);

export const pendingPaymentStatusEnum = pgEnum("pending_payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELLED",
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
    permissions: jsonb("permissions").$type<Record<string, any>>(),
    commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
    passwordHash: text("password_hash"),
    mustChangePassword: boolean("must_change_password").default(false).notNull(),
    referralCode: text("referral_code").unique(),
    referredBy: text("referred_by"),
    isActive: boolean("is_active").default(true).notNull(),
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

// ======================== SYSTEM SETTINGS (SENSITIVE TOKENS) ========================

export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  isConfigured: boolean("is_configured").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ======================== SITE SETTINGS (CONTENT CMS) ========================

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<any>(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ======================== THEME SETTINGS ========================

export const themeSettings = pgTable("theme_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
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
  tagline: text("tagline"),
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
  slug: text("slug"),
  description: text("description"),
  officialPrice: decimal("official_price", { precision: 12, scale: 2 }).notNull(),
  kiyanetPrice: decimal("kiyanet_price", { precision: 12, scale: 2 }).notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  unit: text("unit").default("هر مورد").notNull(),
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
    isExpress: boolean("is_express").default(false).notNull(),
    userNotes: text("user_notes"),
    adminNotes: text("admin_notes"),
    finalOutputFile: text("final_output_file"),
    shippingTrackingCode: text("shipping_tracking_code"),
    commissionPaid: boolean("commission_paid").default(false).notNull(),
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
    type: walletTransactionTypeEnum("type").notNull(),
    orderId: text("order_id"),
    withdrawalId: text("withdrawal_id"),
    balanceAfter: decimal("balance_after", { precision: 15, scale: 2 }),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("wallet_user_idx").on(table.userId)]
);

// ======================== PENDING PAYMENTS ========================

export const pendingPayments = pgTable(
  "pending_payments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    type: pendingPaymentTypeEnum("type").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    gateway: text("gateway").notNull(),
    authority: text("authority").notNull(),
    status: pendingPaymentStatusEnum("status").default("PENDING").notNull(),
    orderId: text("order_id").references(() => orders.id, { onDelete: "set null" }),
    description: text("description"),
    refId: text("ref_id"),
    cardPan: text("card_pan"),
    callbackUrl: text("callback_url").notNull(),
    metadata: jsonb("metadata").$type<Record<string, string>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("pending_user_idx").on(table.userId), index("pending_authority_idx").on(table.authority)]
);

// ======================== WITHDRAWAL REQUESTS ========================

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: text("id").primaryKey(),
  operatorId: text("operator_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: withdrawalStatusEnum("status").default("PENDING").notNull(),
  receiptUrl: text("receipt_url"),
  adminNote: text("admin_note"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================== CARD TO CARD RECEIPTS ========================

export const cardToCardReceipts = pgTable("card_to_card_receipts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  orderId: text("order_id").references(() => orders.id, { onDelete: "set null" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  receiptUrl: text("receipt_url").notNull(),
  status: receiptStatusEnum("status").default("PENDING").notNull(),
  verifiedBy: text("verified_by").references(() => users.id, { onDelete: "set null" }),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================== COUPONS ========================

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  code: text("code").unique().notNull(),
  discountType: discountTypeEnum("discount_type").default("PERCENT").notNull(),
  discountPercent: integer("discount_percent"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  source: discountSourceEnum("source").default("MANUAL").notNull(),
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

// ======================== BUSINESS NETWORK ========================

export const businessNetwork = pgTable("business_network", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  iconName: text("icon_name").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================== ABOUT CONTENT ========================

export const aboutContent = pgTable("about_content", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<any>(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ======================== MENU ITEMS ========================

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  link: text("link").notNull(),
  iconName: text("icon_name"),
  location: menuLocationEnum("location").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// ======================== GAME SCORES ========================

export const gameScores = pgTable(
  "game_scores",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    gameType: text("game_type").notNull(),
    score: integer("score").notNull(),
    points: integer("points").notNull(),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("game_user_idx").on(table.userId), index("game_type_idx").on(table.gameType)]
);

// ======================== GAME CONFIG ========================

export const gameConfig = pgTable("game_config", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<any>(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ======================== NEWS FEEDS ========================

export const newsFeeds = pgTable("news_feeds", {
  id: serial("id").primaryKey(),
  sourceName: text("source_name").notNull(),
  rssUrl: text("rss_url").notNull(),
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// ======================== PREDEFINED ADMINS ========================

export const predefinedAdmins = pgTable("predefined_admins", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  identifierType: identifierTypeEnum("identifier_type").notNull(),
  role: userRoleEnum("role").default("OPERATOR").notNull(),
  assignedModules: jsonb("assigned_modules").$type<string[]>(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  linkedUserId: text("linked_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================== CONTENT EDIT LOGS ========================

export const contentEditLogs = pgTable("content_edit_logs", {
  id: text("id").primaryKey(),
  settingKey: text("setting_key").notNull(),
  tableName: text("table_name"),
  recordId: text("record_id"),
  oldValue: jsonb("old_value").$type<any>(),
  newValue: jsonb("new_value").$type<any>(),
  editedBy: text("edited_by").references(() => users.id, { onDelete: "set null" }),
  editedAt: timestamp("edited_at").defaultNow().notNull(),
});

// ======================== TYPE EXPORTS ========================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type OtpCode = typeof otpCodes.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type ThemeSetting = typeof themeSettings.$inferSelect;
export type IdentityVaultDocument = typeof identityVaultDocuments.$inferSelect;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderChatMessage = typeof orderChatMessages.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;
export type PendingPayment = typeof pendingPayments.$inferSelect;
export type NewPendingPayment = typeof pendingPayments.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type CardToCardReceipt = typeof cardToCardReceipts.$inferSelect;
export type BusinessNetworkItem = typeof businessNetwork.$inferSelect;
export type AboutContentItem = typeof aboutContent.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type GameScore = typeof gameScores.$inferSelect;
export type NewGameScore = typeof gameScores.$inferInsert;
export type GameConfigItem = typeof gameConfig.$inferSelect;
export type NewsFeed = typeof newsFeeds.$inferSelect;
export type PredefinedAdmin = typeof predefinedAdmins.$inferSelect;
export type ContentEditLog = typeof contentEditLogs.$inferSelect;
export type OperatorRating = typeof operatorRatings.$inferSelect;
export type NewOperatorRating = typeof operatorRatings.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;

// ======================== BLOG / REVIEWS / AUDIT ========================
export const blogPosts = pgTable("blog_posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  category: text("category").default("عمومی"),
  tags: jsonb("tags").$type<string[]>(),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  authorId: text("author_id").references(() => users.id),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const serviceReviews = pgTable("service_reviews", {
  id: text("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRecommendations = pgTable("user_recommendations", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================== LOYALTY POINTS ========================
export const loyaltyPoints = pgTable("loyalty_points", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  points: integer("points").default(0).notNull(),
  totalEarned: integer("total_earned").default(0).notNull(),
  level: text("level").default("Bronze").notNull(), // Bronze, Silver, Gold, Platinum
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  points: integer("points").notNull(),
  type: text("type").notNull(), // EARN, REDEEM, BONUS
  description: text("description"),
  orderId: text("order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================== REFERRAL SYSTEM ========================
export const referrals = pgTable("referrals", {
  id: text("id").primaryKey(),
  referrerId: text("referrer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  referredId: text("referred_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: text("status").default("PENDING").notNull(), // PENDING, COMPLETED, PAID
  bonusPoints: integer("bonus_points").default(100).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================== 2FA ========================
export const twoFactorAuth = pgTable("two_factor_auth", {
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).primaryKey(),
  secret: text("secret").notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  backupCodes: jsonb("backup_codes").$type<string[]>(),
  lastUsedAt: timestamp("last_used_at"),
});

// ======================== REPORTS ========================
export const reportExports = pgTable("report_exports", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  type: text("type").notNull(), // ORDERS, REVENUE, USERS
  format: text("format").notNull(), // PDF, EXCEL, CSV
  fileUrl: text("file_url"),
  status: text("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type ServiceReview = typeof serviceReviews.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type UserRecommendation = typeof userRecommendations.$inferSelect;
export type LoyaltyPoint = typeof loyaltyPoints.$inferSelect;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type TwoFactorAuth = typeof twoFactorAuth.$inferSelect;

// ======================== OPERATOR RATINGS ========================
export const operatorRatings = pgTable(
  \"operator_ratings\",
  {
    id: text(\"id\").primaryKey(),
    orderId: text(\"order_id\")
      .references(() => orders.id, { onDelete: \"cascade\" })
      .notNull(),
    userId: text(\"user_id\")
      .references(() => users.id, { onDelete: \"cascade\" })
      .notNull(),
    operatorId: text(\"operator_id\")
      .references(() => users.id, { onDelete: \"cascade\" })
      .notNull(),
    rating: integer(\"rating\").notNull(), // 1-5
    comment: text(\"comment\"),
    createdAt: timestamp(\"created_at\").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex(\"order_rating_unique\").on(table.orderId),
    index(\"operator_rating_idx\").on(table.operatorId),
  ]
);

// ======================== NOTIFICATION PREFERENCES ========================
export const notificationPreferences = pgTable(\"notification_preferences\", {
  userId: text(\"user_id\")
    .references(() => users.id, { onDelete: \"cascade\" })
    .primaryKey(),
  emailEnabled: boolean(\"email_enabled\").default(true).notNull(),
  smsEnabled: boolean(\"sms_enabled\").default(false).notNull(),
  pushEnabled: boolean(\"push_enabled\").default(true).notNull(),
  orderUpdates: boolean(\"order_updates\").default(true).notNull(),
  paymentUpdates: boolean(\"payment_updates\").default(true).notNull(),
  chatMessages: boolean(\"chat_messages\").default(true).notNull(),
  updatedAt: timestamp(\"updated_at\").defaultNow().notNull(),
});

export type OperatorRating = typeof operatorRatings.$inferSelect;
export type NewOperatorRating = typeof operatorRatings.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
