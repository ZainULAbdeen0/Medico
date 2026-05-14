import { Request, Response, NextFunction } from "express";
import {
  getAppointmentsByMonth,
  getBusiestDoctors,
  getStatusBreakdown,
  getSummaryStats
} from "../services/analyticsService";

export const getDashboardData = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [summary, appointmentsByMonth, statusBreakdown, busiestDoctors] =
      await Promise.all([
        getSummaryStats(),
        getAppointmentsByMonth(),
        getStatusBreakdown(),
        getBusiestDoctors()
      ]);

    res.json({
      success: true,
      summary,
      appointmentsByMonth,
      statusBreakdown,
      busiestDoctors
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentTrend = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trend = await getAppointmentsByMonth();
    res.json({ success: true, trend });
  } catch (error) {
    next(error);
  }
};
