import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPatient } from "../../services/patientService";
import { useToast } from "../../context/ToastContext";
import PatientForm from "./PatientForm";

const PatientCreate = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleCreate = async (payload) => {
        setIsSubmitting(true);
        setError("");
        try {
            await createPatient(payload);
            toast.success("Patient created");
            navigate("/patients");
        } catch (err) {
            const message =
                err?.response?.data?.message || "Failed to create patient";
            setError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-xs text-gray-500">
                        <Link to="/patients" className="hover:text-slate-700">
                            Patients
                        </Link>
                        <span className="mx-1">/</span>
                        <span>New patient</span>
                    </div>
                    <h1 className="mt-1 text-xl font-semibold text-gray-900">
                        Add Patient
                    </h1>
                    <p className="text-sm text-gray-500">
                        Create a new patient profile.
                    </p>
                </div>
                <Link
                    to="/patients"
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </Link>
            </header>

            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            ) : null}

            <div className="rounded-lg border border-gray-200 bg-white p-5">
                <PatientForm
                    onSubmit={handleCreate}
                    isSubmitting={isSubmitting}
                    submitLabel="Create Patient"
                />
            </div>
        </section>
    );
};

export default PatientCreate;
