import api from "./api";

export const getAuditLogs = (params) => api.get("/api/audit-logs", { params });
