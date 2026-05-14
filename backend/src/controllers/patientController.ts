import { Request, Response, NextFunction } from "express";
import Patient from "../models/Patient";

export const createPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await Patient.create({
      ...req.body,
      registeredBy: req.user?.userId
    });

    res.status(201).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

export const getPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { isActive: true };
    if (search) {
      query.$text = { $search: String(search) };
    }

    const [patients, total] = await Promise.all([
      Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Patient.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.json({
      success: true,
      patients,
      total,
      page,
      totalPages
    });
  } catch (error) {
    next(error);
  }
};

export const getPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient || !patient.isActive) {
      res.status(404).json({ success: false, message: "Patient not found" });
      return;
    }
    res.json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!patient) {
      res.status(404).json({ success: false, message: "Patient not found" });
      return;
    }

    res.json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!patient) {
      res.status(404).json({ success: false, message: "Patient not found" });
      return;
    }

    res.json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};