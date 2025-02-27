import { pgTable, text, serial, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isBouncer: boolean("is_bouncer").notNull().default(false),
});

export const bars = pgTable("bars", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  currentCount: integer("current_count").notNull().default(0),
  capacity: integer("capacity").notNull(),
  address: text("address").notNull(),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBarSchema = createInsertSchema(bars);
export const updateCountSchema = z.object({
  count: z.number().min(0),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Bar = typeof bars.$inferSelect;
export type InsertBar = z.infer<typeof insertBarSchema>;
export type UpdateCount = z.infer<typeof updateCountSchema>;