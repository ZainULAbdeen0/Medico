import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorForm from "./DoctorForm";
import { createDoctor } from "../../services/doctorService";

const DoctorCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (payload) => {
    setIsSubmitting(true);
    setError("");
    try {
      await createDoctor(payload);
      navigate("/doctors");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create doctor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Add Doctor</h1>
        <p className="text-sm text-gray-600">Create a doctor profile.</p>
      </div>
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <DoctorForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
    </section>
  );
};

export default DoctorCreate;