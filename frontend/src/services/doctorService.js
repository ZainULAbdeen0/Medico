import api from "./api";

export const getDoctors = (params) => api.get("/api/doctors", { params });
export const getDoctor = (id) => api.get(`/api/doctors/${id}`);
export const createDoctor = (data) => api.post("/api/doctors", data);
export const updateDoctor = (id, data) => api.put(`/api/doctors/${id}`, data);
export const getDoctorSchedule = (doctorId) => api.get(`/api/doctors/${doctorId}/schedule`);
export const setSchedule = (data) => api.post("/api/schedules", data);
export const getDoctorUsers = () => api.get("/api/doctors/users");