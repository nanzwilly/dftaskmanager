import { pgTable, serial, text, varchar, timestamp, boolean, integer, pgEnum, date } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "user"]);
export const statusEnum = pgEnum("task_status", ["todo", "in_progress", "done"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: statusEnum("status").notNull().default("todo"),
  dueDate: timestamp("due_date"),
  ownerId: integer("owner_id").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  invitedBy: integer("invited_by").references(() => users.id).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  accepted: boolean("accepted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agendaDates = pgTable("agenda_dates", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agendaItems = pgTable("agenda_items", {
  id: serial("id").primaryKey(),
  agendaDateId: integer("agenda_date_id").references(() => agendaDates.id, { onDelete: "cascade" }).notNull(),
  text: varchar("text", { length: 500 }).notNull(),
  checked: boolean("checked").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull().default(""),
  userId: integer("user_id").references(() => users.id).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type AgendaDate = typeof agendaDates.$inferSelect;
export type AgendaItem = typeof agendaItems.$inferSelect;
