import api from "./api";

export const getDashboardData = () => api.get("/api/analytics/dashboard");
export const getAppointmentTrend = () => api.get("/api/analytics/trend");
