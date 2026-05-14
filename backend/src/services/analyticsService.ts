import Appointment from "../models/Appointment";
import Doctor from "../models/Doctor";
import Patient from "../models/Patient";

// Appointment count per month for the current year, normalized to all 12
// months so the chart shows 0 for empty months instead of skipping them.
export const getAppointmentsByMonth = async () => {
  const currentYear = new Date().getFullYear();

  const raw = await Appointment.aggregate([
    {
      $match: {
        appointmentDate: {
          $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$appointmentDate" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const counts = new Map<number, number>(raw.map((item) => [item._id, item.count]));

  return Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    count: counts.get(index + 1) || 0
  }));
};

// Top 5 doctors by completed appointment count, with names resolved
// through doctors → users.
export const getBusiestDoctors = async () => {
  return Appointment.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: "$doctorId",
        totalAppointments: { $sum: 1 }
      }
    },
    { $sort: { totalAppointments: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "doctors",
        localField: "_id",
        foreignField: "_id",
        as: "doctor"
      }
    },
    { $unwind: "$doctor" },
    {
      $lookup: {
        from: "users",
        localField: "doctor.userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        doctorName: "$user.name",
        specialization: "$doctor.specialization",
        totalAppointments: 1
      }
    }
  ]);
};

export const getStatusBreakdown = async () => {
  return Appointment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);
};

export const getSummaryStats = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [totalPatients, totalDoctors, todayAppointments, pendingAppointments] =
    await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Doctor.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfToday, $lte: endOfToday }
      }),
      Appointment.countDocuments({ status: "pending" })
    ]);

  return { totalPatients, totalDoctors, todayAppointments, pendingAppointments };
};
