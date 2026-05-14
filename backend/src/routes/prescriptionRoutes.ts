import { Router } from "express";
import { createPrescription, getPrescription, updatePrescription } from "../controllers/prescriptionController";
import { authorize, verifyToken } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createPrescriptionSchema,
  updatePrescriptionSchema
} from "../validators/prescriptionValidators";

const router = Router();

router.post(
  "/",
  verifyToken,
  authorize(["doctor"]),
  validate(createPrescriptionSchema),
  createPrescription
);
router.get("/:id", verifyToken, getPrescription);
router.put(
  "/:id",
  verifyToken,
  authorize(["doctor"]),
  validate(updatePrescriptionSchema),
  updatePrescription
);
export default router;