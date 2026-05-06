import { pgTable, text, serial, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const medicalHistoryTable = pgTable("medical_history", {
  id: serial("id").primaryKey(),
  doctorName: text("doctor_name").notNull(),
  specialty: text("specialty").notNull(),
  date: date("date").notNull(),
  diagnosis: text("diagnosis").notNull(),
  prescription: text("prescription"),
  notes: text("notes"),
});

export const insertMedicalHistorySchema = createInsertSchema(medicalHistoryTable).omit({ id: true });
export type InsertMedicalHistory = z.infer<typeof insertMedicalHistorySchema>;
export type MedicalHistory = typeof medicalHistoryTable.$inferSelect;
