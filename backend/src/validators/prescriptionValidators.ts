import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const medicineSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1)
});

export const createPrescriptionSchema = z.object({
  body: z.object({
    appointmentId: objectId,
    patientId: objectId,
    medicines: z.array(medicineSchema).min(1),
    diagnosis: z.string().min(1),
    notes: z.string().optional()
  })
});

export const updatePrescriptionSchema = z.object({
  body: z.object({
    medicines: z.array(medicineSchema).min(1).optional(),
    notes: z.string().optional()
  })
});