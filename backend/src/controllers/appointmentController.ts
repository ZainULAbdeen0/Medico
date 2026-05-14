import { Request, Response, NextFunction } from "express";
import Appointment, { AppointmentStatus } from "../models/Appointment";
import Doctor from "../models/Doctor";
import Patient from "../models/Patient";
import { checkConflict } from "../services/appointmentService";

const populateAppointment = [
  { path: "patientId", select: "name bloodGroup" },
  {
    path: "doctorId",
    select: "specialization userId",
    populate: { path: "userId", select: "name" }
  }
];

export const createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId, doctorId, appointmentDate, type, notes } = req.body;

    const [patient, doctor] = await Promise.all([
      Patient.findById(patientId).select("_id"),
      Doctor.findById(doctorId).select("_id")
    ]);

    if (!patient || !doctor) {
      res.status(404).json({ success: false, message: "Patient or doctor not found" });
      return;
    }

    const conflict = await checkConflict(doctorId, appointmentDate);
    if (conflict) {
      res.status(409).json({ success: false, message: "Doctor has a scheduling conflict" });
      return;
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      type,
      notes,
      status: "pending",
      createdBy: req.user?.userId
    });

    const populated = await Appointment.findById(appointment._id).populate(populateAppointment);
    res.status(201).json({ success: true, appointment: populated });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = req.user?.role;
    const filters: Record<string, unknown> = {};

    if (role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user?.userId }).select("_id");
      if (!doctor) {
        res.status(404).json({ success: false, message: "Doctor profile not found" });
        return;
      }
      filters.doctorId = doctor._id;
    } else {
      const { doctorId, patientId, status } = req.query;
      if (doctorId) {
        filters.doctorId = doctorId;
      }
      if (patientId) {
        filters.patientId = patientId;
      }
      if (status) {
        filters.status = status;
      }
    }

    if (req.query.date) {
      const dateValue = new Date(String(req.query.date));
      const start = new Date(dateValue);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateValue);
      end.setHours(23, 59, 59, 999);
      filters.appointmentDate = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(filters)
      .sort({ appointmentDate: 1 })
      .populate(populateAppointment);

    res.json({ success: true, appointments });
  } catch (error) {
    next(error);
  }
};

export const getAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(populateAppointment);
    if (!appointment) {
      res.status(404).json({ success: false, message: "Appointment not found" });
      return;
    }
    res.json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404).json({ success: false, message: "Appointment not found" });
      return;
    }

    const nextStatus = req.body.status as AppointmentStatus;
    const role = req.user?.role;

    if (role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user?.userId }).select("_id");
      if (!doctor || String(doctor._id) !== String(appointment.doctorId)) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }
    }

    const transitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["completed", "cancelled"],
      completed: [],
      cancelled: []
    };

    const allowed = transitions[appointment.status] || [];
    if (!allowed.includes(nextStatus)) {
      res.status(400).json({ success: false, message: "Invalid status transition" });
      return;
    }

    if (role === "doctor" && !(nextStatus === "confirmed" || nextStatus === "completed")) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    if ((role === "receptionist" || role === "admin") && nextStatus !== "cancelled") {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    appointment.status = nextStatus;
    await appointment.save();
    const populated = await Appointment.findById(appointment._id).populate(populateAppointment);
    res.json({ success: true, appointment: populated });
  } catch (error) {
    next(error);
  }
};