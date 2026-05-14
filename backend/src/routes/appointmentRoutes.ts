import { Router } from "express";
import {
  createAppointment,
  getAppointment,
  getAppointments,
  updateStatus
} from "../controllers/appointmentController";
import { authorize, verifyToken } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema
} from "../validators/appointmentValidators";

const router = Router();

router.post(
  "/",
  verifyToken,
  authorize(["receptionist", "admin"]),
  validate(createAppointmentSchema),
  createAppointment
);
router.get("/", verifyToken, getAppointments);
router.get("/:id", verifyToken, getAppointment);
router.patch(
  "/:id/status",
  verifyToken,
  validate(updateAppointmentStatusSchema),
  updateStatus
);

export default router;