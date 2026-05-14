import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPatient, updatePatient } from "../../services/patientService";
import PatientForm from "./PatientForm";

const PatientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await getPatient(id);
        setPatient(response.data.patient);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load patient");
      }
    };

    fetchPatient();
  }, [id]);

  const handleUpdate = async (payload) => {
    setIsSubmitting(true);
    setError("");
    try {
      await updatePatient(id, payload);
      navigate(`/patients/${id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit Patient</h1>
        <p className="text-sm text-gray-600">Update patient information.</p>
      </div>
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {!patient && !error ? <p className="text-sm text-gray-500">Loading patient...</p> : null}
      {patient ? <PatientForm patient={patient} onSubmit={handleUpdate} isSubmitting={isSubmitting} /> : null}
    </section>
  );
};

export default PatientEdit;