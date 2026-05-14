import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const createDoctorSchema = z.object({
  body: z.object({
    userId: objectId,
    specialization: z.string().min(2),
    department: z.string().min(2),
    qualifications: z.array(z.string()).optional(),
    bio: z.string().optional()
  })
});

export const updateDoctorSchema = z.object({
  body: z.object({
    specialization: z.string().min(2).optional(),
    department: z.string().min(2).optional(),
    qualifications: z.array(z.string()).optional(),
    bio: z.string().optional()
  })
});