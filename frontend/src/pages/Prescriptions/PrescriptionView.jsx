import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    getPrescription,
    updatePrescription
} from "../../services/prescriptionService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const emptyMedicine = { name: "", dosage: "", frequency: "", duration: "" };

const SkeletonBlock = ({ className = "" }) => (
    <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

const InfoBlock = ({ label, value }) => (
    <div>
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
        </div>
        <div className="mt-1 text-sm font-medium text-gray-900">
            {value || "—"}
        </div>
    </div>
);

const PrescriptionView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const toast = useToast();
    const [prescription, setPrescription] = useState(null);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draft, setDraft] = useState(null);

    const fetchPrescription = async () => {
        try {
            const response = await getPrescription(id);
            setPrescription(response.data.prescription);
        } catch (err) {
            setError(
                err?.response?.data?.message || "Failed to load prescription"
            );
        }
    };

    useEffect(() => {
        setPrescription(null);
        setError("");
        fetchPrescription();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const startEdit = () => {
        if (!prescription) return;
        setDraft({
            diagnosis: prescription.diagnosis || "",
            notes: prescription.notes || "",
            medicines: prescription.medicines?.length
                ? prescription.medicines.map((m) => ({
                      name: m.name || "",
                      dosage: m.dosage || "",
                      frequency: m.frequency || "",
                      duration: m.duration || ""
                  }))
                : [{ ...emptyMedicine }]
        });
        setEditing(true);
    };

    const updateMedicine = (index, field, value) => {
        setDraft((prev) => ({
            ...prev,
            medicines: prev.medicines.map((med, i) =>
                i === index ? { ...med, [field]: value } : med
            )
        }));
    };

    const addMedicine = () =>
        setDraft((prev) => ({
            ...prev,
            medicines: [...prev.medicines, { ...emptyMedicine }]
        }));

    const removeMedicine = (index) =>
        setDraft((prev) => ({
            ...prev,
            medicines:
                prev.medicines.length > 1
                    ? prev.medicines.filter((_, i) => i !== index)
                    : prev.medicines
        }));

    const handleSave = async () => {
        if (!draft) return;
        if (!draft.diagnosis.trim()) {
            toast.error("Diagnosis is required");
            return;
        }
        const invalid = draft.medicines.some(
            (m) =>
                !m.name.trim() ||
                !m.dosage.trim() ||
                !m.frequency.trim() ||
                !m.duration.trim()
        );
        if (invalid) {
            toast.error("All medicine fields are required");
            return;
        }
        setIsSaving(true);
        try {
            await updatePrescription(id, {
                diagnosis: draft.diagnosis,
                notes: draft.notes || undefined,
                medicines: draft.medicines
            });
            toast.success("Prescription updated");
            await fetchPrescription();
            setEditing(false);
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                    "Failed to update prescription"
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
            </div>
        );
    }

    if (!prescription) {
        return (
            <div className="space-y-4">
                <SkeletonBlock className="h-6 w-56" />
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-48 w-full" />
            </div>
        );
    }

    const canEdit = user?.role === "doctor";

    return (
        <section className="space-y-6 print:space-y-3">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between print:hidden">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Prescription
                    </h1>
                    <p className="text-sm text-gray-500">
                        Issued on{" "}
                        {new Date(prescription.createdAt).toLocaleString()}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Print
                    </button>
                    {canEdit && !editing ? (
                        <button
                            type="button"
                            onClick={startEdit}
                            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Edit
                        </button>
                    ) : null}
                </div>
            </header>

            <div className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 print:border-0 print:p-0 print:shadow-none">
                <div className="grid gap-4 sm:grid-cols-3">
                    <InfoBlock
                        label="Patient"
                        value={prescription.patientId?.name}
                    />
                    <InfoBlock
                        label="Doctor"
                        value={prescription.doctorId?.userId?.name}
                    />
                    <InfoBlock
                        label="Date"
                        value={new Date(
                            prescription.createdAt
                        ).toLocaleString()}
                    />
                </div>

                {!editing ? (
                    <>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">
                                Medicines
                            </h2>
                            <div className="mt-2 overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-wide text-gray-500">
                                            <th className="py-2 pr-3">Name</th>
                                            <th className="py-2 pr-3">
                                                Dosage
                                            </th>
                                            <th className="py-2 pr-3">
                                                Frequency
                                            </th>
                                            <th className="py-2">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {prescription.medicines.map(
                                            (medicine, index) => (
                                                <tr
                                                    key={index}
                                                    className="text-gray-700"
                                                >
                                                    <td className="py-2 pr-3 font-medium text-gray-900">
                                                        {medicine.name}
                                                    </td>
                                                    <td className="py-2 pr-3">
                                                        {medicine.dosage}
                                                    </td>
                                                    <td className="py-2 pr-3">
                                                        {medicine.frequency}
                                                    </td>
                                                    <td className="py-2">
                                                        {medicine.duration}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">
                                Diagnosis
                            </h2>
                            <p className="mt-1 text-sm text-gray-700">
                                {prescription.diagnosis}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">
                                Notes
                            </h2>
                            <p className="mt-1 text-sm text-gray-700">
                                {prescription.notes || "—"}
                            </p>
                        </div>
                    </>
                ) : null}

                {editing && draft ? (
                    <>
                        <div>
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Medicines
                                </h2>
                                <button
                                    type="button"
                                    onClick={addMedicine}
                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Add medicine
                                </button>
                            </div>
                            <div className="mt-3 space-y-3">
                                {draft.medicines.map((medicine, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 md:grid-cols-5"
                                    >
                                        <input
                                            value={medicine.name}
                                            onChange={(event) =>
                                                updateMedicine(
                                                    index,
                                                    "name",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Name"
                                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        />
                                        <input
                                            value={medicine.dosage}
                                            onChange={(event) =>
                                                updateMedicine(
                                                    index,
                                                    "dosage",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Dosage (500mg)"
                                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        />
                                        <input
                                            value={medicine.frequency}
                                            onChange={(event) =>
                                                updateMedicine(
                                                    index,
                                                    "frequency",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Frequency (2x daily)"
                                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        />
                                        <input
                                            value={medicine.duration}
                                            onChange={(event) =>
                                                updateMedicine(
                                                    index,
                                                    "duration",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Duration (7 days)"
                                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeMedicine(index)
                                            }
                                            disabled={
                                                draft.medicines.length === 1
                                            }
                                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Diagnosis
                            </label>
                            <textarea
                                value={draft.diagnosis}
                                onChange={(event) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        diagnosis: event.target.value
                                    }))
                                }
                                rows={3}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <textarea
                                value={draft.notes}
                                onChange={(event) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        notes: event.target.value
                                    }))
                                }
                                rows={2}
                                placeholder="Optional"
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            />
                        </div>

                        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(false);
                                    setDraft(null);
                                }}
                                disabled={isSaving}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </>
                ) : null}
            </div>
        </section>
    );
};

export default PrescriptionView;
