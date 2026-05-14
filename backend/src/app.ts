import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { apiLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/authRoutes";
import patientRoutes from "./routes/patientRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import prescriptionRoutes from "./routes/prescriptionRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import auditRoutes from "./routes/auditRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize());

app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "Hospital API" });
});

app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit-logs", auditRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;