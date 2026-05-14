import mongoose, { Document, Model, Schema } from "mongoose";

export interface AuditLogDocument extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: Schema.Types.ObjectId },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// TTL index — MongoDB auto-deletes audit logs older than 90 days
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
auditLogSchema.index({ userId: 1 });

const AuditLog: Model<AuditLogDocument> = mongoose.model<AuditLogDocument>(
  "AuditLog",
  auditLogSchema
);

export default AuditLog;
