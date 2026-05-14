import api from "./api";

export const getAppointments = (params) => api.get("/api/appointments", { params });
export const getAppointment = (id) => api.get(`/api/appointments/${id}`);
export const createAppointment = (data) => api.post("/api/appointments", data);
export const updateAppointmentStatus = (id, status) =>
  api.patch(`/api/appointments/${id}/status`, { status });