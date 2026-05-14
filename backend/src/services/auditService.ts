import AuditLog from "../models/AuditLog";
import { AuditAction } from "../utils/auditActions";

interface AuditEntry {
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
}

// Fire and forget — auditing must never block or fail the main request.
export const log = ({ userId, action, resource, resourceId, ipAddress }: AuditEntry): void => {
  AuditLog.create({
    userId,
    action,
    resource,
    resourceId,
    ipAddress,
    timestamp: new Date()
  }).catch((err) => console.error("Audit log failed:", err));
};
