import { z } from "zod";

const contactsSchema = z.object({
  phone: z.string().min(7),
  emergency: z.string().min(7).optional(),
  address: z.string().min(3).optional()
});

export const createPatientSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    dob: z.coerce.date(),
    gender: z.enum(["male", "female", "other"]),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
    allergies: z.array(z.string()).optional(),
    contacts: contactsSchema
  })
});

export const updatePatientSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    dob: z.coerce.date().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]).optional(),
    allergies: z.array(z.string()).optional(),
    contacts: contactsSchema.partial().optional()
  })
});