import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format");

export const createScheduleSchema = z.object({
  body: z.object({
    doctorId: objectId,
    day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
    startTime: time,
    endTime: time,
    isActive: z.boolean().optional()
  })
});