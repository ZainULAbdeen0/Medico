import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getPatient, updatePatient } from "../../services/patientService";
import { useToast } from "../../context/ToastContext";
import PatientForm from "./PatientForm";

const PatientEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [patient, setPatient] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const response = await getPatient(id);
                setPatient(response.data.patient);
            } catch (err) {
                setError(
                    err?.response?.data?.message || "Failed to load patient"
                );
            }
        };

        fetchPatient();
    }, [id]);

    const handleUpdate = async (payload) => {
        setIsSubmitting(true);
        setError("");
        try {
            await updatePatient(id, payload);
            toast.success("Patient updated");
            navigate(`/patients/${id}`);
        } catch (err) {
            const message =
                err?.response?.data?.message || "Failed to update patient";
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
                        <Link
                            to={`/patients/${id}`}
                            className="hover:text-slate-700"
                        >
                            {patient?.name || "Patient"}
                        </Link>
                        <span className="mx-1">/</span>
                        <span>Edit</span>
                    </div>
                    <h1 className="mt-1 text-xl font-semibold text-gray-900">
                        Edit Patient
                    </h1>
                    <p className="text-sm text-gray-500">
                        Update patient information.
                    </p>
                </div>
                <Link
                    to={`/patients/${id}`}
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
                {!patient && !error ? (
                    <div className="space-y-3">
                        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
                            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
                            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
                            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
                        </div>
                    </div>
                ) : null}
                {patient ? (
                    <PatientForm
                        patient={patient}
                        onSubmit={handleUpdate}
                        isSubmitting={isSubmitting}
                        submitLabel="Save Changes"
                    />
                ) : null}
            </div>
        </section>
    );
};

export default PatientEdit;
