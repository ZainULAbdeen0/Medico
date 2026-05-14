import { Router } from "express";
import {
  createDoctor,
  getDoctor,
  getDoctors,
  updateDoctor,
  getDoctorSchedule,
  getDoctorUsers
} from "../controllers/doctorController";
import { authorize, verifyToken } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createDoctorSchema, updateDoctorSchema } from "../validators/doctorValidators";

const router = Router();

router.get("/users", verifyToken, authorize(["admin"]), getDoctorUsers);
router.post("/", verifyToken, authorize(["admin"]), validate(createDoctorSchema), createDoctor);
router.get("/", verifyToken, getDoctors);
router.get("/:id", verifyToken, getDoctor);
router.put("/:id", verifyToken, authorize(["admin"]), validate(updateDoctorSchema), updateDoctor);
router.get("/:id/schedule", verifyToken, getDoctorSchedule);

export default router;