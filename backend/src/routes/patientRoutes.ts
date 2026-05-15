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
import { getPatientHistory } from "../controllers/patientHistoryController";

const router = Router();

/**
 * @openapi
 * /api/patients:
 *   post:
 *     tags: [Patients]
 *     summary: Create a patient
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, dob, gender, bloodGroup, contacts]
 *             properties:
 *               name: { type: string, minLength: 2 }
 *               dob: { type: string, format: date }
 *               gender: { type: string, enum: [male, female, other] }
 *               bloodGroup: { type: string, enum: ["A+","A-","B+","B-","O+","O-","AB+","AB-"] }
 *               allergies: { type: array, items: { type: string } }
 *               contacts: { $ref: '#/components/schemas/PatientContacts' }
 *     responses:
 *       201:
 *         description: Patient created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Patient' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *   get:
 *     tags: [Patients]
 *     summary: List patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Optional name/phone search filter
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Patient' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post(
  "/",
  verifyToken,
  authorize(["receptionist", "admin"]),
  validate(createPatientSchema),
  createPatient
);
router.get("/", verifyToken, getPatients);

/**
 * @openapi
 * /api/patients/{id}:
 *   get:
 *     tags: [Patients]
 *     summary: Get a single patient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Patient
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Patient' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   put:
 *     tags: [Patients]
 *     summary: Update a patient
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
 *               name: { type: string, minLength: 2 }
 *               dob: { type: string, format: date }
 *               gender: { type: string, enum: [male, female, other] }
 *               bloodGroup: { type: string, enum: ["A+","A-","B+","B-","O+","O-","AB+","AB-"] }
 *               allergies: { type: array, items: { type: string } }
 *               contacts: { $ref: '#/components/schemas/PatientContacts' }
 *     responses:
 *       200:
 *         description: Updated patient
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Patient' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Patients]
 *     summary: Delete a patient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/:id", verifyToken, getPatient);

/**
 * @openapi
 * /api/patients/{patientId}/prescriptions:
 *   get:
 *     tags: [Patients]
 *     summary: List prescriptions for a patient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Prescriptions list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Prescription' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get(
  "/:patientId/prescriptions",
  verifyToken,
  authorize(["doctor", "admin", "receptionist"]),
  getPatientPrescriptions
);

/**
 * @openapi
 * /api/patients/{patientId}/history:
 *   get:
 *     tags: [Patients]
 *     summary: Aggregated patient history (appointments + prescriptions)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Aggregated history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     patient: { $ref: '#/components/schemas/Patient' }
 *                     appointments:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Appointment' }
 *                     prescriptions:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Prescription' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get(
  "/:patientId/history",
  verifyToken,
  authorize(["doctor", "admin", "receptionist"]),
  getPatientHistory
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
