import { useCallback, useEffect, useState } from "react";
import { getPatients } from "../services/patientService";

export const usePatients = ({ search, page }) => {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getPatients({ search, page, limit: 10 });
      setPatients(response.data.patients || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return { patients, total, totalPages, isLoading, error, refresh: fetchPatients };
};