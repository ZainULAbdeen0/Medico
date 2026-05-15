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

/**
 * @openapi
 * /api/doctors/users:
 *   get:
 *     tags: [Doctors]
 *     summary: List user accounts with the "doctor" role that don't yet have a doctor profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available doctor users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.get("/users", verifyToken, authorize(["admin"]), getDoctorUsers);

/**
 * @openapi
 * /api/doctors:
 *   post:
 *     tags: [Doctors]
 *     summary: Create a doctor profile (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, specialization, department]
 *             properties:
 *               userId: { type: string, description: "ObjectId of an existing User with role=doctor" }
 *               specialization: { type: string, minLength: 2 }
 *               department: { type: string, minLength: 2 }
 *               qualifications: { type: array, items: { type: string } }
 *               bio: { type: string }
 *     responses:
 *       201:
 *         description: Doctor created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Doctor' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *   get:
 *     tags: [Doctors]
 *     summary: List doctors
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctors list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Doctor' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post("/", verifyToken, authorize(["admin"]), validate(createDoctorSchema), createDoctor);
router.get("/", verifyToken, getDoctors);

/**
 * @openapi
 * /api/doctors/{id}:
 *   get:
 *     tags: [Doctors]
 *     summary: Get a single doctor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Doctor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Doctor' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   put:
 *     tags: [Doctors]
 *     summary: Update a doctor profile (admin only)
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
 *               specialization: { type: string, minLength: 2 }
 *               department: { type: string, minLength: 2 }
 *               qualifications: { type: array, items: { type: string } }
 *               bio: { type: string }
 *     responses:
 *       200:
 *         description: Updated doctor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Doctor' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/:id", verifyToken, getDoctor);
router.put("/:id", verifyToken, authorize(["admin"]), validate(updateDoctorSchema), updateDoctor);

/**
 * @openapi
 * /api/doctors/{id}/schedule:
 *   get:
 *     tags: [Doctors]
 *     summary: Get a doctor's weekly schedule
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/:id/schedule", verifyToken, getDoctorSchedule);

export default router;
