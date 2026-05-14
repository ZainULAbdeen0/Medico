import mongoose, { Document, Model, Schema } from "mongoose";

export interface MedicineEntry {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface PrescriptionDocument extends Document {
  appointmentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  medicines: MedicineEntry[];
  diagnosis: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const medicineSchema = new Schema<MedicineEntry>(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const prescriptionSchema = new Schema<PrescriptionDocument>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    medicines: { type: [medicineSchema], required: true },
    diagnosis: { type: String, required: true },
    notes: { type: String }
  },
  { timestamps: true }
);

prescriptionSchema.index({ appointmentId: 1 }, { unique: true });
prescriptionSchema.index({ patientId: 1 });

const Prescription: Model<PrescriptionDocument> = mongoose.model<PrescriptionDocument>(
  "Prescription",
  prescriptionSchema
);

export default Prescription;