import { Router } from "express";
import { authorize, verifyToken } from "../middleware/auth";
import { getDashboardData, getAppointmentTrend } from "../controllers/analyticsController";

const router = Router();

/**
 * @openapi
 * /api/analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Aggregate counts for the admin dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard totals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPatients: { type: integer }
 *                     totalDoctors: { type: integer }
 *                     totalAppointments: { type: integer }
 *                     totalPrescriptions: { type: integer }
 *                     appointmentsByStatus:
 *                       type: object
 *                       additionalProperties: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get("/dashboard", verifyToken, authorize(["admin"]), getDashboardData);

/**
 * @openapi
 * /api/analytics/trend:
 *   get:
 *     tags: [Analytics]
 *     summary: Appointment count trend over the last N days
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, minimum: 1, default: 30 }
 *     responses:
 *       200:
 *         description: Series of date -> count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date: { type: string, format: date }
 *                       count: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get("/trend", verifyToken, authorize(["admin"]), getAppointmentTrend);

export default router;
