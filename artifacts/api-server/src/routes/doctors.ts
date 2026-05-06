import { Router, type IRouter } from "express";
import { eq, like } from "drizzle-orm";
import { db, doctorsTable, usersTable } from "@workspace/db";
import {
  ListDoctorsQueryParams,
  GetDoctorParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function syncRegisteredDoctors() {
  const [doctorUsers, doctorProfiles] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.role, "doctor")),
    db.select().from(doctorsTable),
  ]);

  const existingNames = new Set(doctorProfiles.map((doctor) => doctor.name.toLowerCase()));
  const missingDoctors = doctorUsers.filter((user) => !existingNames.has(user.name.toLowerCase()));

  if (missingDoctors.length === 0) return;

  await db.insert(doctorsTable).values(
    missingDoctors.map((doctor) => ({
      name: doctor.name,
      specialty: "General Physician",
      qualification: "MBBS",
      experience: 1,
      fee: 1500,
      availableTimes: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
      rating: 4.5,
      totalPatients: 0,
    })),
  );
}

router.get("/doctors", async (req, res): Promise<void> => {
  const parsed = ListDoctorsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await syncRegisteredDoctors();

  let query = db.select().from(doctorsTable);

  if (parsed.data.specialty) {
    const doctors = await db
      .select()
      .from(doctorsTable)
      .where(like(doctorsTable.specialty, `%${parsed.data.specialty}%`));
    res.json(doctors);
    return;
  }

  const doctors = await query;
  res.json(doctors);
});

router.get("/doctors/:id", async (req, res): Promise<void> => {
  const params = GetDoctorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [doctor] = await db
    .select()
    .from(doctorsTable)
    .where(eq(doctorsTable.id, params.data.id));

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json(doctor);
});

export default router;
