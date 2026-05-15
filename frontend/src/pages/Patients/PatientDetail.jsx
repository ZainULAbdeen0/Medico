import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPatient, updatePatient } from "../../services/patientService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PatientForm from "./PatientForm";

const SkeletonBlock = ({ className = "" }) => (
    <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

const DetailSkeleton = () => (
    <div className="space-y-4">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="h-4 w-32" />
        <div className="grid gap-4 md:grid-cols-2">
            <SkeletonBlock className="h-28 w-full" />
            <SkeletonBlock className="h-28 w-full" />
        </div>
        <SkeletonBlock className="h-20 w-full" />
    </div>
);

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="text-right font-medium text-gray-900">
            {value || "—"}
        </span>
    </div>
);

const PatientDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const toast = useToast();
    const [patient, setPatient] = useState(null);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchPatient = async () => {
        try {
            const response = await getPatient(id);
            setPatient(response.data.patient);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load patient");
        }
    };

    useEffect(() => {
        setPatient(null);
        setError("");
        fetchPatient();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const canEdit = user?.role === "admin" || user?.role === "receptionist";

    const handleSave = async (payload) => {
        setIsSaving(true);
        try {
            await updatePatient(id, payload);
            toast.success("Patient updated");
            await fetchPatient();
            setEditing(false);
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to update patient"
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="font-medium">Couldn't load patient</div>
                <div className="mt-1">{error}</div>
                <Link
                    to="/patients"
                    className="mt-3 inline-block rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                    Back to list
                </Link>
            </div>
        );
    }

    if (!patient) {
        return <DetailSkeleton />;
    }

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-xs text-gray-500">
                        <Link to="/patients" className="hover:text-slate-700">
                            Patients
                        </Link>
                        <span className="mx-1">/</span>
                        <span>{patient.name}</span>
                    </div>
                    <h1 className="mt-1 text-xl font-semibold text-gray-900">
                        {patient.name}
                    </h1>
                    <p className="text-sm text-gray-500">Patient profile</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        to={`/patients/${id}/history`}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        View History
                    </Link>
                    {canEdit && !editing ? (
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Edit
                        </button>
                    ) : null}
                </div>
            </header>

            {editing ? (
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h2 className="mb-4 text-sm font-semibold text-gray-900">
                        Edit Patient
                    </h2>
                    <PatientForm
                        patient={patient}
                        onSubmit={handleSave}
                        isSubmitting={isSaving}
                        formId="patient-detail-form"
                        hideSubmit
                    />
                    <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-gray-200 pt-4">
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            disabled={isSaving}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="patient-detail-form"
                            disabled={isSaving}
                            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-white p-5">
                            <h2 className="mb-2 text-sm font-semibold text-gray-900">
                                Basic Info
                            </h2>
                            <div className="divide-y divide-gray-100">
                                <InfoRow
                                    label="Date of Birth"
                                    value={
                                        patient.dob
                                            ? new Date(
                                                  patient.dob
                                              ).toLocaleDateString()
                                            : null
                                    }
                                />
                                <InfoRow
                                    label="Gender"
                                    value={
                                        patient.gender
                                            ? patient.gender
                                                  .charAt(0)
                                                  .toUpperCase() +
                                              patient.gender.slice(1)
                                            : null
                                    }
                                />
                                <InfoRow
                                    label="Blood Group"
                                    value={patient.bloodGroup}
                                />
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-5">
                            <h2 className="mb-2 text-sm font-semibold text-gray-900">
                                Contacts
                            </h2>
                            <div className="divide-y divide-gray-100">
                                <InfoRow
                                    label="Phone"
                                    value={patient.contacts?.phone}
                                />
                                <InfoRow
                                    label="Emergency"
                                    value={patient.contacts?.emergency}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <h2 className="mb-3 text-sm font-semibold text-gray-900">
                            Allergies
                        </h2>
                        {patient.allergies?.length ? (
                            <div className="flex flex-wrap gap-2">
                                {patient.allergies.map((item) => (
                                    <span
                                        key={item}
                                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                No allergies recorded.
                            </p>
                        )}
                    </div>
                </>
            )}
        </section>
    );
};

export default PatientDetail;
