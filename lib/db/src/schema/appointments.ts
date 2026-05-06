import { pgTable, text, serial, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull(),
  doctorName: text("doctor_name").notNull(),
  specialty: text("specialty").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("upcoming"),
  fee: integer("fee").notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({ id: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;
