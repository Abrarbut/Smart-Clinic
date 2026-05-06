import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, appointmentsTable, doctorsTable } from "@workspace/db";
import {
  ListAppointmentsQueryParams,
  CreateAppointmentBody,
  GetAppointmentParams,
  CancelAppointmentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/appointments", async (req, res): Promise<void> => {
  const parsed = ListAppointmentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let rows;
  if (parsed.data.status) {
    rows = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.status, parsed.data.status));
  } else {
    rows = await db.select().from(appointmentsTable);
  }

  res.json(rows);
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [doctor] = await db
    .select()
    .from(doctorsTable)
    .where(eq(doctorsTable.id, parsed.data.doctorId));

  if (!doctor) {
    res.status(400).json({ error: "Doctor not found" });
    return;
  }

  const dateStr = parsed.data.date instanceof Date
    ? parsed.data.date.toISOString().split("T")[0]
    : String(parsed.data.date);

  const [appointment] = await db
    .insert(appointmentsTable)
    .values({
      doctorId: parsed.data.doctorId,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: dateStr,
      time: parsed.data.time,
      reason: parsed.data.reason ?? null,
      status: "upcoming",
      fee: doctor.fee,
    })
    .returning();

  res.status(201).json(appointment);
});

router.get("/appointments/:id", async (req, res): Promise<void> => {
  const params = GetAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [appointment] = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.id, params.data.id));

  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  res.json(appointment);
});

router.patch("/appointments/:id/cancel", async (req, res): Promise<void> => {
  const params = CancelAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [appointment] = await db
    .update(appointmentsTable)
    .set({ status: "cancelled" })
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  res.json(appointment);
});

export default router;
