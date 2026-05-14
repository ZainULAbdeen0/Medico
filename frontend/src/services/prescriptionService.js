import api from "./api";

export const createPrescription = (data) => api.post("/api/prescriptions", data);
export const getPrescription = (id) => api.get(`/api/prescriptions/${id}`);
export const getPrescriptionByAppointment = (appointmentId) =>
  api.get("/api/prescriptions/by-appointment", { params: { appointmentId } });
export const updatePrescription = (id, data) => api.put(`/api/prescriptions/${id}`, data);
export const getPatientPrescriptions = (patientId) =>
  api.get(`/api/patients/${patientId}/prescriptions`);
