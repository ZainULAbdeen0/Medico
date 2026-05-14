import Appointment from "../models/Appointment";

export const checkConflict = async (doctorId: string, appointmentDate: Date): Promise<boolean> => {
  const windowStart = new Date(appointmentDate.getTime() - 30 * 60000);
  const windowEnd = new Date(appointmentDate.getTime() + 30 * 60000);

  const conflict = await Appointment.findOne({
    doctorId,
    appointmentDate: { $gte: windowStart, $lte: windowEnd },
    status: { $nin: ["cancelled"] }
  }).select("_id");

  return Boolean(conflict);
};