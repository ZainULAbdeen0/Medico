import { Router } from "express";
import { authorize, verifyToken } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createScheduleSchema } from "../validators/scheduleValidators";
import { getScheduleByDoctor, setSchedule } from "../controllers/scheduleController";

const router = Router();

/**
 * @openapi
 * /api/schedules:
 *   post:
 *     tags: [Schedules]
 *     summary: Create or replace a schedule entry for a doctor on a given day
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, day, startTime, endTime]
 *             properties:
 *               doctorId: { type: string }
 *               day: { type: string, enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday] }
 *               startTime: { type: string, example: "09:00", description: "HH:MM 24-hour" }
 *               endTime: { type: string, example: "17:00" }
 *               isActive: { type: boolean }
 *     responses:
 *       201:
 *         description: Schedule entry saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Schedule' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post("/", verifyToken, authorize(["admin"]), validate(createScheduleSchema), setSchedule);

/**
 * @openapi
 * /api/schedules/{doctorId}:
 *   get:
 *     tags: [Schedules]
 *     summary: Get all schedule entries for a doctor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Schedule entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Schedule' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/:doctorId", verifyToken, getScheduleByDoctor);

export default router;
