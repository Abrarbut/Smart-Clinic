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

const INVALID_REPEAT_TLD = /(?:\.com){2,}$|(?:\.net){2,}$|(?:\.org){2,}$|(?:\.edu){2,}$|(?:\.gov){2,}$/i;

const emailSchema = z
  .string()
  .email()
  .refine((value) => !value.includes(".."), {
    message: "Email contains consecutive dots",
  })
  .refine((value) => !INVALID_REPEAT_TLD.test(value), {
    message: "Email domain is invalid",
  });

export const registerBodySchema = z.object({
  name: z.string().min(2),
  email: emailSchema,
  password: z.string().min(6),
  role: z.enum(["patient", "doctor", "receptionist", "admin"]).default("patient"),
});

export const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});
