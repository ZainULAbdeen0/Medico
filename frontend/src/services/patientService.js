import api from "./api";

export const getPatients = (params) => api.get("/api/patients", { params });
export const getPatient = (id) => api.get(`/api/patients/${id}`);
export const createPatient = (data) => api.post("/api/patients", data);
export const updatePatient = (id, data) => api.put(`/api/patients/${id}`, data);