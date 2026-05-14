import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPatient } from "../../services/patientService";
import PatientForm from "./PatientForm";

const PatientCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (payload) => {
    setIsSubmitting(true);
    setError("");
    try {
      await createPatient(payload);
      navigate("/patients");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Add Patient</h1>
        <p className="text-sm text-gray-600">Create a new patient profile.</p>
      </div>
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <PatientForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
    </section>
  );
};

export default PatientCreate;