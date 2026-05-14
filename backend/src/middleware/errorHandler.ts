import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";

const getDuplicateKeyMessage = (error: Record<string, unknown>): string => {
  const keyValue = (error as { keyValue?: Record<string, unknown> }).keyValue;
  const field = keyValue ? Object.keys(keyValue)[0] : "field";
  return `${field} already exists`;
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = err.message || "Server error";

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid ID format";
  } else if ((err as { code?: number }).code === 11000) {
    statusCode = 409;
    message = getDuplicateKeyMessage(err as Record<string, unknown>);
  }

  const response: Record<string, unknown> = {
    success: false,
    message
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};