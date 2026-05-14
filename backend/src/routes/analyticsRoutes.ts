import { Router } from "express";
import { authorize, verifyToken } from "../middleware/auth";
import { getDashboardData, getAppointmentTrend } from "../controllers/analyticsController";

const router = Router();

router.get("/dashboard", verifyToken, authorize(["admin"]), getDashboardData);
router.get("/trend", verifyToken, authorize(["admin"]), getAppointmentTrend);

export default router;
