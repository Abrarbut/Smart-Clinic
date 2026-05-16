import { Router } from "express";
import { db, usersTable, appointmentsTable, doctorsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { getSessionUserId } from "../lib/session";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (!getSessionUserId(req)) { res.status(401).json({ error: "Not authenticated" }); return; }
  next();
}

router.get("/admin/users", requireAdmin, async (req, res) => {
  const users = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(usersTable.createdAt);
  res.json(users);
});

router.patch("/admin/users/:id/role", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { role } = req.body;
  if (!["patient","doctor","receptionist","admin"].includes(role)) {
    res.status(400).json({ error: "Invalid role" }); return;
  }
  const [updated] = await db.update(usersTable).set({ role }).where(eq(usersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role, createdAt: updated.createdAt });
});

router.get("/admin/stats", requireAdmin, async (req, res) => {
  const [userStats] = await db.select({ total: count() }).from(usersTable);
  const [apptStats] = await db.select({ total: count() }).from(appointmentsTable);
  const [doctorStats] = await db.select({ total: count() }).from(doctorsTable);
  const roleRows = await db.select({ role: usersTable.role, cnt: count() }).from(usersTable).groupBy(usersTable.role);
  const roleCounts: Record<string, number> = {};
  roleRows.forEach(r => { roleCounts[r.role] = Number(r.cnt); });
  res.json({
    totalUsers: Number(userStats.total),
    totalDoctors: Number(doctorStats.total),
    totalAppointments: Number(apptStats.total),
    roleCounts,
  });
});

export default router;
