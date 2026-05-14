import mongoose from "mongoose";
import Appointment from "../models/Appointment";
import Patient from "../models/Patient";

export const getFullPatientHistory = async (patientId: string) => {
  const objectId = new mongoose.Types.ObjectId(patientId);

  const result = await Appointment.aggregate([
    // STAGE 1: Filter appointments for this patient (uses patientId index)
    { $match: { patientId: objectId } },

    // STAGE 2: Most recent appointment first
    { $sort: { appointmentDate: -1 } },

    // STAGE 3: Join the prescription (if any) for each appointment
    {
      $lookup: {
        from: "prescriptions",
        localField: "_id",
        foreignField: "appointmentId",
        as: "prescription"
      }
    },

    // STAGE 4: Flatten the prescription array — keep appointments without one
    {
      $unwind: {
        path: "$prescription",
        preserveNullAndEmptyArrays: true
      }
    },

    // STAGE 5: Join the doctor profile
    {
      $lookup: {
        from: "doctors",
        localField: "doctorId",
        foreignField: "_id",
        as: "doctor"
      }
    },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },

    // STAGE 6: Join the doctor's user account for the name
    {
      $lookup: {
        from: "users",
        localField: "doctor.userId",
        foreignField: "_id",
        as: "doctorUser"
      }
    },
    { $unwind: { path: "$doctorUser", preserveNullAndEmptyArrays: true } },

    // STAGE 7: Shape the output — only what the timeline view needs
    {
      $project: {
        appointmentDate: 1,
        status: 1,
        type: 1,
        notes: 1,
        doctorName: "$doctorUser.name",
        specialization: "$doctor.specialization",
        department: "$doctor.department",
        prescription: {
          _id: "$prescription._id",
          diagnosis: "$prescription.diagnosis",
          medicines: "$prescription.medicines",
          notes: "$prescription.notes",
          createdAt: "$prescription.createdAt"
        }
      }
    }
  ]);

  return result;
};

export const getPatientSummary = async (patientId: string) => {
  const objectId = new mongoose.Types.ObjectId(patientId);

  const [patient, appointmentStats] = await Promise.all([
    Patient.findById(objectId).select("-__v"),
    Appointment.aggregate([
      { $match: { patientId: objectId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  return { patient, appointmentStats };
};
