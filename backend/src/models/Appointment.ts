import mongoose, { Document, Model, Schema } from "mongoose";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type AppointmentType = "general" | "follow-up" | "emergency";

export interface AppointmentDocument extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
}

const appointmentSchema = new Schema<AppointmentDocument>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending"
    },
    type: {
      type: String,
      enum: ["general", "follow-up", "emergency"],
      required: true
    },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ status: 1 });

const Appointment: Model<AppointmentDocument> = mongoose.model<AppointmentDocument>(
  "Appointment",
  appointmentSchema
);

export default Appointment;