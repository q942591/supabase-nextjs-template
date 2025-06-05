import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const polarCustomerTable = pgTable("polar_customer", {
  createdAt: timestamp("created_at").notNull(),
  customerId: text("customer_id").notNull().unique(),
  id: text("id").primaryKey(),
  updatedAt: timestamp("updated_at").notNull(),
  userId: text("user_id").notNull(),
});

export const polarSubscriptionTable = pgTable("polar_subscription", {
  createdAt: timestamp("created_at").notNull(),
  customerId: text("customer_id").notNull(),
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  status: text("status").notNull(),
  subscriptionId: text("subscription_id").notNull().unique(),
  updatedAt: timestamp("updated_at").notNull(),
  userId: text("user_id").notNull(),
});
