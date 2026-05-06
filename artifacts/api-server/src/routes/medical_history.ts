import { Router, type IRouter } from "express";
import { db, medicalHistoryTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/medical-history", async (_req, res): Promise<void> => {
  const rows = await db.select().from(medicalHistoryTable);
  res.json(rows);
});

export default router;
