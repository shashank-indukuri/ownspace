import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wedding events table
export const weddings = pgTable("weddings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  brideName: varchar("bride_name").notNull(),
  groomName: varchar("groom_name").notNull(),
  weddingDate: timestamp("wedding_date").notNull(),
  venue: varchar("venue").notNull(),
  venueAddress: text("venue_address"),
  description: text("description"),
  status: varchar("status").notNull().default("active"), // active, draft, completed
  rsvpCode: varchar("rsvp_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest categories
export const guestCategories = pgTable("guest_categories", {
  id: serial("id").primaryKey(),
  weddingId: integer("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(), // Wedding Party, Family, Friends, Colleagues, etc.
  color: varchar("color").notNull().default("#D4AF37"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Guests table
export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  weddingId: integer("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => guestCategories.id),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone").notNull(),
  address: text("address"),
  rsvpStatus: varchar("rsvp_status").notNull().default("pending"), // pending, confirmed, declined
  guestCount: integer("guest_count").notNull().default(1),
  dietaryRestrictions: text("dietary_restrictions"),
  notes: text("notes"),
  invitationSent: boolean("invitation_sent").notNull().default(false),
  invitationSentAt: timestamp("invitation_sent_at"),
  rsvpSubmittedAt: timestamp("rsvp_submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communication logs
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  weddingId: integer("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  guestId: integer("guest_id").references(() => guests.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // email, sms, whatsapp
  subject: varchar("subject"),
  message: text("message").notNull(),
  status: varchar("status").notNull().default("sent"), // sent, delivered, failed, bounced
  sentAt: timestamp("sent_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  weddings: many(weddings),
}));

export const weddingsRelations = relations(weddings, ({ one, many }) => ({
  user: one(users, {
    fields: [weddings.userId],
    references: [users.id],
  }),
  guests: many(guests),
  categories: many(guestCategories),
  communicationLogs: many(communicationLogs),
}));

export const guestCategoriesRelations = relations(guestCategories, ({ one, many }) => ({
  wedding: one(weddings, {
    fields: [guestCategories.weddingId],
    references: [weddings.id],
  }),
  guests: many(guests),
}));

export const guestsRelations = relations(guests, ({ one, many }) => ({
  wedding: one(weddings, {
    fields: [guests.weddingId],
    references: [weddings.id],
  }),
  category: one(guestCategories, {
    fields: [guests.categoryId],
    references: [guestCategories.id],
  }),
  communicationLogs: many(communicationLogs),
}));

export const communicationLogsRelations = relations(communicationLogs, ({ one }) => ({
  wedding: one(weddings, {
    fields: [communicationLogs.weddingId],
    references: [weddings.id],
  }),
  guest: one(guests, {
    fields: [communicationLogs.guestId],
    references: [guests.id],
  }),
}));

// Create insert and select schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertWeddingSchema = createInsertSchema(weddings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rsvpCode: true,
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestCategorySchema = createInsertSchema(guestCategories).omit({
  id: true,
  createdAt: true,
});

export const insertCommunicationLogSchema = createInsertSchema(communicationLogs).omit({
  id: true,
  sentAt: true,
});

// Export types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Wedding = typeof weddings.$inferSelect;
export type InsertWedding = z.infer<typeof insertWeddingSchema>;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type GuestCategory = typeof guestCategories.$inferSelect;
export type InsertGuestCategory = z.infer<typeof insertGuestCategorySchema>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
