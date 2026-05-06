import { Router, type IRouter } from "express";
import { db, doctorsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/specialties", async (_req, res): Promise<void> => {
  const rows = await db.select({ specialty: doctorsTable.specialty }).from(doctorsTable);
  const unique = [...new Set(rows.map((r) => r.specialty))].sort();
  res.json(unique);
});

export default router;
