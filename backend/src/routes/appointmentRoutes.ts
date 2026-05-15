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

/**
 * @openapi
 * /api/appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Book a new appointment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, doctorId, appointmentDate, type]
 *             properties:
 *               patientId: { type: string }
 *               doctorId: { type: string }
 *               appointmentDate: { type: string, format: date-time }
 *               type: { type: string, enum: [general, follow-up, emergency] }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Appointment created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Appointment' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *   get:
 *     tags: [Appointments]
 *     summary: List appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         schema: { type: string }
 *       - in: query
 *         name: patientId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, completed, cancelled] }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Appointments list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Appointment' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post(
  "/",
  verifyToken,
  authorize(["receptionist", "admin"]),
  validate(createAppointmentSchema),
  createAppointment
);
router.get("/", verifyToken, getAppointments);

/**
 * @openapi
 * /api/appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get a single appointment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Appointment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Appointment' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/:id", verifyToken, getAppointment);

/**
 * @openapi
 * /api/appointments/{id}/status:
 *   patch:
 *     tags: [Appointments]
 *     summary: Update an appointment's status
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, confirmed, completed, cancelled] }
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Appointment' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch(
  "/:id/status",
  verifyToken,
  validate(updateAppointmentStatusSchema),
  updateStatus
);

export default router;
