import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: objectId,
    doctorId: objectId,
    appointmentDate: z.coerce.date(),
    type: z.enum(["general", "follow-up", "emergency"]),
    notes: z.string().optional()
  })
});

export const updateAppointmentStatusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "confirmed", "completed", "cancelled"])
  })
});