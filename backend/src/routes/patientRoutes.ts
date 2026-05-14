import { Router } from "express";
import {
  createPatient,
  getPatient,
  getPatients,
  updatePatient,
  deletePatient
} from "../controllers/patientController";
import { validate } from "../middleware/validate";
import { createPatientSchema, updatePatientSchema } from "../validators/patientValidators";
import { authorize, verifyToken } from "../middleware/auth";
import { getPatientPrescriptions } from "../controllers/prescriptionController";

const router = Router();

router.post(
  "/",
  verifyToken,
  authorize(["receptionist", "admin"]),
  validate(createPatientSchema),
  createPatient
);
router.get("/", verifyToken, getPatients);
router.get("/:id", verifyToken, getPatient);
router.get(
  "/:patientId/prescriptions",
  verifyToken,
  authorize(["doctor", "admin", "receptionist"]),
  getPatientPrescriptions
);
router.put(
  "/:id",
  verifyToken,
  authorize(["receptionist", "admin"]),
  validate(updatePatientSchema),
  updatePatient
);
router.delete("/:id", verifyToken, authorize(["admin"]), deletePatient);

export default router;