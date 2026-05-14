import { Router } from "express";
import { authorize, verifyToken } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createScheduleSchema } from "../validators/scheduleValidators";
import { getScheduleByDoctor, setSchedule } from "../controllers/scheduleController";

const router = Router();

router.post("/", verifyToken, authorize(["admin"]), validate(createScheduleSchema), setSchedule);
router.get("/:doctorId", verifyToken, getScheduleByDoctor);

export default router;