import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPatientHistory } from "../../services/historyService";
import EmptyState from "../../components/EmptyState";

const statusBadge = (status) => {
    const map = {
        pending: "bg-amber-50 text-amber-800 border-amber-200",
        confirmed: "bg-slate-100 text-slate-800 border-slate-200",
        completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
        cancelled: "bg-red-50 text-red-800 border-red-200"
    };
    return map[status] || "bg-gray-100 text-gray-700 border-gray-200";
};

const statusCount = (stats, status) =>
    stats.find((item) => item._id === status)?.count || 0;

const SkeletonBlock = ({ className = "" }) => (
    <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

const HistorySkeleton = () => (
    <div className="space-y-4">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="h-4 w-32" />
        <div className="grid gap-4 md:grid-cols-3">
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-20 w-full" />
        </div>
        <SkeletonBlock className="h-32 w-full" />
    </div>
);

const PatientHistory = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        setData(null);
        setError("");
        getPatientHistory(id)
            .then((response) => setData(response.data))
            .catch((err) =>
                setError(
                    err?.response?.data?.message || "Failed to load history"
                )
            );
    }, [id]);

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
            </div>
        );
    }

    if (!data) {
        return <HistorySkeleton />;
    }

    const { patient, appointmentStats, history } = data;
    const total = appointmentStats.reduce((sum, item) => sum + item.count, 0);

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
                            {patient.name}
                        </Link>
                        <span className="mx-1">/</span>
                        <span>History</span>
                    </div>
                    <h1 className="mt-1 text-xl font-semibold text-gray-900">
                        {patient.name}
                    </h1>
                    <p className="text-sm text-gray-500">
                        Full medical history
                    </p>
                </div>
                <Link
                    to={`/patients/${id}`}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Back to patient
                </Link>
            </header>

            <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">
                    Summary
                </h2>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div className="flex justify-between border-b border-gray-100 py-1">
                        <span className="text-gray-500">Date of Birth</span>
                        <span className="font-medium text-gray-900">
                            {new Date(patient.dob).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                        <span className="text-gray-500">Blood Group</span>
                        <span className="font-medium text-gray-900">
                            {patient.bloodGroup || "—"}
                        </span>
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {patient.allergies?.length ? (
                        patient.allergies.map((item) => (
                            <span
                                key={item}
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                            >
                                {item}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-gray-500">
                            No allergies recorded.
                        </span>
                    )}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    { label: "Total Appointments", value: total },
                    {
                        label: "Completed",
                        value: statusCount(appointmentStats, "completed")
                    },
                    {
                        label: "Cancelled",
                        value: statusCount(appointmentStats, "cancelled")
                    }
                ].map((card) => (
                    <div
                        key={card.label}
                        className="rounded-lg border border-gray-200 bg-white p-5"
                    >
                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            {card.label}
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-gray-900">
                            {card.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-900">
                    Timeline
                </h2>
                {history.length ? (
                    <ol className="space-y-3">
                        {history.map((entry) => (
                            <li
                                key={entry._id}
                                className="rounded-lg border border-gray-200 bg-white p-5"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {new Date(
                                            entry.appointmentDate
                                        ).toLocaleString()}
                                    </div>
                                    <span
                                        className={`rounded-full border px-3 py-0.5 text-xs font-medium capitalize ${statusBadge(
                                            entry.status
                                        )}`}
                                    >
                                        {entry.status}
                                    </span>
                                </div>
                                <div className="mt-1 text-sm text-gray-600">
                                    {entry.doctorName} · {entry.department} ·{" "}
                                    {entry.type}
                                </div>

                                {entry.prescription?._id ? (
                                    <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                                        <div className="text-sm font-semibold text-gray-800">
                                            Diagnosis:{" "}
                                            {entry.prescription.diagnosis}
                                        </div>
                                        <div className="mt-2 overflow-x-auto">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="text-left text-gray-500">
                                                        <th className="py-1 pr-2">
                                                            Medicine
                                                        </th>
                                                        <th className="py-1 pr-2">
                                                            Dosage
                                                        </th>
                                                        <th className="py-1 pr-2">
                                                            Frequency
                                                        </th>
                                                        <th className="py-1 pr-2">
                                                            Duration
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {entry.prescription.medicines?.map(
                                                        (medicine, index) => (
                                                            <tr
                                                                key={index}
                                                                className="text-gray-700"
                                                            >
                                                                <td className="py-1 pr-2 font-medium">
                                                                    {
                                                                        medicine.name
                                                                    }
                                                                </td>
                                                                <td className="py-1 pr-2">
                                                                    {
                                                                        medicine.dosage
                                                                    }
                                                                </td>
                                                                <td className="py-1 pr-2">
                                                                    {
                                                                        medicine.frequency
                                                                    }
                                                                </td>
                                                                <td className="py-1 pr-2">
                                                                    {
                                                                        medicine.duration
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-3 text-xs text-gray-500">
                                        No prescription recorded.
                                    </div>
                                )}
                            </li>
                        ))}
                    </ol>
                ) : (
                    <div className="rounded-lg border border-gray-200 bg-white">
                        <EmptyState
                            title="No appointments yet"
                            description="When this patient has an appointment, it will appear here."
                        />
                    </div>
                )}
            </div>
        </section>
    );
};

export default PatientHistory;
