import mongoose, { Document, Model, Schema } from "mongoose";

export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface ScheduleDocument extends Document {
  doctorId: mongoose.Types.ObjectId;
  day: Weekday;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const scheduleSchema = new Schema<ScheduleDocument>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

scheduleSchema.index({ doctorId: 1 });
scheduleSchema.index({ doctorId: 1, day: 1 }, { unique: true });

const Schedule: Model<ScheduleDocument> = mongoose.model<ScheduleDocument>("Schedule", scheduleSchema);

export default Schedule;