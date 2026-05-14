import mongoose, { Document, Model, Schema } from "mongoose";

export type PatientGender = "male" | "female" | "other";
export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "O+"
  | "O-"
  | "AB+"
  | "AB-";

export interface PatientDocument extends Document {
  name: string;
  dob: Date;
  gender: PatientGender;
  bloodGroup: BloodGroup;
  allergies: string[];
  contacts: {
    phone: string;
    emergency?: string;
    address?: string;
  };
  registeredBy: mongoose.Types.ObjectId;
  isActive: boolean;
}

const patientSchema = new Schema<PatientDocument>(
  {
    name: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      required: true
    },
    allergies: { type: [String], default: [] },
    contacts: {
      phone: { type: String, required: true },
      emergency: { type: String },
      address: { type: String }
    },
    registeredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

patientSchema.index({ name: "text", "contacts.phone": 1 });

const Patient: Model<PatientDocument> = mongoose.model<PatientDocument>("Patient", patientSchema);

export default Patient;