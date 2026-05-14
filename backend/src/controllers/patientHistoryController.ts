import { Request, Response, NextFunction } from "express";
import { getFullPatientHistory, getPatientSummary } from "../services/patientHistoryService";

export const getPatientHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { patientId } = req.params;

    const [{ patient, appointmentStats }, history] = await Promise.all([
      getPatientSummary(patientId),
      getFullPatientHistory(patientId)
    ]);

    if (!patient) {
      res.status(404).json({ success: false, message: "Patient not found" });
      return;
    }

    res.json({ success: true, patient, appointmentStats, history });
  } catch (error) {
    next(error);
  }
};
