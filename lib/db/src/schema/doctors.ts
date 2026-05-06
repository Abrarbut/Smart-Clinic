import { pgTable, text, serial, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  qualification: text("qualification").notNull(),
  experience: integer("experience").notNull(),
  fee: integer("fee").notNull(),
  availableTimes: text("available_times").array().notNull().default([]),
  rating: real("rating").notNull().default(4.5),
  totalPatients: integer("total_patients").notNull().default(0),
});

export const insertDoctorSchema = createInsertSchema(doctorsTable).omit({ id: true });
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctorsTable.$inferSelect;
