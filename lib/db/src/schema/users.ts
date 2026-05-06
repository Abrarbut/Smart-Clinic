import { pgTable, text, serial, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["patient", "doctor", "receptionist", "admin"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("patient"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type UserRole = "patient" | "doctor" | "receptionist" | "admin";
export type User = typeof usersTable.$inferSelect;
export type InsertUser = Omit<User, "id" | "createdAt">;

export const registerBodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["patient", "doctor", "receptionist", "admin"]).default("patient"),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});
