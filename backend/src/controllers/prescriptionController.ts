import { Request, Response, NextFunction } from "express";
import Prescription from "../models/Prescription";
import Appointment from "../models/Appointment";
import Doctor from "../models/Doctor";
import { log } from "../services/auditService";
import { AUDIT_ACTIONS } from "../utils/auditActions";

const populatePrescription = [
  { path: "patientId", select: "name" },
  { path: "doctorId", select: "userId", populate: { path: "userId", select: "name" } }
];

export const createPrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { appointmentId, patientId, medicines, diagnosis, notes } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user?.userId }).select("_id");
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor profile not found" });
      return;
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      res.status(404).json({ success: false, message: "Appointment not found" });
      return;
    }

    if (String(appointment.doctorId) !== String(doctor._id)) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    const existing = await Prescription.findOne({ appointmentId }).select("_id");
    if (existing) {
      res.status(409).json({ success: false, message: "Prescription already exists" });
      return;
    }

    const prescription = await Prescription.create({
      appointmentId,
      patientId,
      doctorId: doctor._id,
      medicines,
      diagnosis,
      notes
    });

    appointment.status = "completed";
    await appointment.save();

    log({
      userId: req.user!.userId,
      action: AUDIT_ACTIONS.CREATE_PRESCRIPTION,
      resource: "prescriptions",
      resourceId: prescription._id.toString(),
      ipAddress: req.ip
    });

    const populated = await Prescription.findById(prescription._id).populate(populatePrescription);
    res.status(201).json({ success: true, prescription: populated });
  } catch (error) {
    next(error);
  }
};

export const getPrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let prescription = null;
    const { appointmentId } = req.query;

    if (appointmentId) {
      prescription = await Prescription.findOne({ appointmentId }).populate(populatePrescription);
    } else {
      prescription = await Prescription.findById(req.params.id).populate(populatePrescription);
    }

    if (!prescription) {
      res.status(404).json({ success: false, message: "Prescription not found" });
      return;
    }

    res.json({ success: true, prescription });
  } catch (error) {
    next(error);
  }
};

export const getPatientPrescriptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId })
      .sort({ createdAt: -1 })
      .populate(populatePrescription);

    res.json({ success: true, prescriptions });
  } catch (error) {
    next(error);
  }
};

export const updatePrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user?.userId }).select("_id");
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor profile not found" });
      return;
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      res.status(404).json({ success: false, message: "Prescription not found" });
      return;
    }

    if (String(prescription.doctorId) !== String(doctor._id)) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (prescription.createdAt < cutoff) {
      res.status(400).json({ success: false, message: "Prescription can no longer be updated" });
      return;
    }

    if (req.body.medicines) {
      prescription.medicines = req.body.medicines;
    }
    if (req.body.notes !== undefined) {
      prescription.notes = req.body.notes;
    }

    await prescription.save();
    const populated = await Prescription.findById(prescription._id).populate(populatePrescription);
    res.json({ success: true, prescription: populated });
  } catch (error) {
    next(error);
  }
};