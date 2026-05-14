import { Request, Response, NextFunction } from "express";
import AuditLog from "../models/AuditLog";

export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, action, startDate, endDate } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (userId) {
      query.userId = userId;
    }
    if (action) {
      query.action = action;
    }
    if (startDate || endDate) {
      const range: Record<string, Date> = {};
      if (startDate) {
        range.$gte = new Date(String(startDate));
      }
      if (endDate) {
        range.$lte = new Date(String(endDate));
      }
      query.timestamp = range;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email"),
      AuditLog.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.json({ success: true, logs, total, page, totalPages });
  } catch (error) {
    next(error);
  }
};
