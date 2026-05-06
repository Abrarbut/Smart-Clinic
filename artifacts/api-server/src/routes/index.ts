import { Router, type IRouter } from "express";
import healthRouter from "./health";
import doctorsRouter from "./doctors";
import appointmentsRouter from "./appointments";
import medicalHistoryRouter from "./medical_history";
import specialtiesRouter from "./specialties";
import dashboardRouter from "./dashboard";
import authRouter from "./auth";
import adminRouter from "./admin";
import patientsRouter from "./patients";

const router: IRouter = Router();

router.use(authRouter);
router.use(adminRouter);
router.use(healthRouter);
router.use(doctorsRouter);
router.use(patientsRouter);
router.use(appointmentsRouter);
router.use(medicalHistoryRouter);
router.use(specialtiesRouter);
router.use(dashboardRouter);

export default router;
