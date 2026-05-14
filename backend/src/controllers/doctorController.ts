import { Request, Response, NextFunction } from "express";
import Doctor from "../models/Doctor";
import Schedule from "../models/Schedule";
import User from "../models/User";

export const createDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, specialization, department, qualifications, bio } = req.body;

    const user = await User.findById(userId).select("_id role");
    if (!user || user.role !== "doctor") {
      res.status(400).json({ success: false, message: "User must exist and have doctor role" });
      return;
    }

    const existing = await Doctor.findOne({ userId }).select("_id");
    if (existing) {
      res.status(409).json({ success: false, message: "Doctor profile already exists" });
      return;
    }

    const doctor = await Doctor.create({
      userId,
      specialization,
      department,
      qualifications: qualifications || [],
      bio
    });

    res.status(201).json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
};

export const getDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { department } = req.query;
    const filter: Record<string, unknown> = {};
    if (department) {
      filter.department = department;
    }

    const doctors = await Doctor.find(filter).populate("userId", "name email");
    res.json({ success: true, doctors });
  } catch (error) {
    next(error);
  }
};

export const getDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("userId", "name email");
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor not found" });
      return;
    }
    res.json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("userId", "name email");

    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor not found" });
      return;
    }

    res.json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
};

export const getDoctorSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const schedules = await Schedule.find({ doctorId: req.params.id }).sort({ day: 1 });
    res.json({ success: true, schedules });
  } catch (error) {
    next(error);
  }
};

export const getDoctorUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find({ role: "doctor", isActive: true }).select("name email");
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};