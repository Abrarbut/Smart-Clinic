import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, appointmentsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const all = await db.select().from(appointmentsTable);

  const upcoming = all.filter((a) => a.status === "upcoming");
  const completed = all.filter((a) => a.status === "completed");
  const cancelled = all.filter((a) => a.status === "cancelled");
  const totalSpent = completed.reduce((sum, a) => sum + a.fee, 0);

  const nextAppointment = upcoming.sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return a.time.localeCompare(b.time);
  })[0] ?? null;

  res.json({
    totalAppointments: all.length,
    upcomingAppointments: upcoming.length,
    completedAppointments: completed.length,
    cancelledAppointments: cancelled.length,
    totalSpent,
    nextAppointment: nextAppointment ?? undefined,
  });
});

export default router;
