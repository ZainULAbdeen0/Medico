import { Request, Response, NextFunction } from "express";
import Schedule from "../models/Schedule";
import Doctor from "../models/Doctor";

export const setSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { doctorId, day, startTime, endTime, isActive } = req.body;

    const doctorExists = await Doctor.exists({ _id: doctorId });
    if (!doctorExists) {
      res.status(404).json({ success: false, message: "Doctor not found" });
      return;
    }

    const schedule = await Schedule.findOneAndUpdate(
      { doctorId, day },
      { doctorId, day, startTime, endTime, isActive: isActive ?? true },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ success: true, schedule });
  } catch (error) {
    next(error);
  }
};

export const getScheduleByDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const schedules = await Schedule.find({ doctorId: req.params.doctorId }).sort({ day: 1 });
    res.json({ success: true, schedules });
  } catch (error) {
    next(error);
  }
};