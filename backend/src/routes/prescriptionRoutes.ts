import { Router } from "express";
import { createPrescription, getPrescription, updatePrescription } from "../controllers/prescriptionController";
import { authorize, verifyToken } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createPrescriptionSchema,
  updatePrescriptionSchema
} from "../validators/prescriptionValidators";

const router = Router();

/**
 * @openapi
 * /api/prescriptions:
 *   post:
 *     tags: [Prescriptions]
 *     summary: Create a prescription (doctor only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId, patientId, medicines, diagnosis]
 *             properties:
 *               appointmentId: { type: string }
 *               patientId: { type: string }
 *               medicines:
 *                 type: array
 *                 minItems: 1
 *                 items: { $ref: '#/components/schemas/Medicine' }
 *               diagnosis: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Prescription created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Prescription' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post(
  "/",
  verifyToken,
  authorize(["doctor"]),
  validate(createPrescriptionSchema),
  createPrescription
);

/**
 * @openapi
 * /api/prescriptions/{id}:
 *   get:
 *     tags: [Prescriptions]
 *     summary: Get a single prescription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Prescription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Prescription' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   put:
 *     tags: [Prescriptions]
 *     summary: Update a prescription (doctor only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicines:
 *                 type: array
 *                 minItems: 1
 *                 items: { $ref: '#/components/schemas/Medicine' }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Updated prescription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Prescription' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/:id", verifyToken, getPrescription);
router.put(
  "/:id",
  verifyToken,
  authorize(["doctor"]),
  validate(updatePrescriptionSchema),
  updatePrescription
);
export default router;
