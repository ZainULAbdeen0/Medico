import api from "./api";

export const getPatientHistory = (patientId) =>
  api.get(`/api/patients/${patientId}/history`);
