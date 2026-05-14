import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes";
import patientRoutes from "./routes/patientRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "Hospital API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;