import mongoose, { Document, Model, Schema } from "mongoose";

export interface DoctorDocument extends Document {
  userId: mongoose.Types.ObjectId;
  specialization: string;
  department: string;
  qualifications: string[];
  bio?: string;
}

const doctorSchema = new Schema<DoctorDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialization: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    qualifications: { type: [String], default: [] },
    bio: { type: String }
  },
  { timestamps: true }
);

doctorSchema.index({ department: 1 });

const Doctor: Model<DoctorDocument> = mongoose.model<DoctorDocument>("Doctor", doctorSchema);

export default Doctor;