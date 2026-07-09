export const operatorRatings = pgTable(
  "operator_ratings",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    operatorId: text("operator_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("order_rating_unique").on(table.orderId),
    index("operator_rating_idx").on(table.operatorId),
  ]
);

export const notificationPreferences = pgTable("notification_preferences", {
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .primaryKey(),
  emailEnabled: boolean("email_enabled").default(true).notNull(),
  smsEnabled: boolean("sms_enabled").default(false).notNull(),
  pushEnabled: boolean("push_enabled").default(true).notNull(),
  orderUpdates: boolean("order_updates").default(true).notNull(),
  paymentUpdates: boolean("payment_updates").default(true).notNull(),
  chatMessages: boolean("chat_messages").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});