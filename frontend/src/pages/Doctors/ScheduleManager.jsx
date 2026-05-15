import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    getDoctor,
    getDoctorSchedule,
    setSchedule
} from "../../services/doctorService";
import { useToast } from "../../context/ToastContext";
import EmptyState from "../../components/EmptyState";

const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const buildDefault = () =>
    daysOfWeek.map((day) => ({
        day,
        startTime: "09:00",
        endTime: "17:00",
        isActive: false
    }));

const SkeletonBlock = ({ className = "" }) => (
    <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

const ScheduleManager = () => {
    const { id } = useParams();
    const toast = useToast();
    const [doctor, setDoctor] = useState(null);
    const [rows, setRows] = useState(buildDefault);
    const [originalRows, setOriginalRows] = useState(buildDefault);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState("");

    const loadAll = async () => {
        setIsLoading(true);
        setError("");
        try {
            const [doctorRes, scheduleRes] = await Promise.all([
                getDoctor(id),
                getDoctorSchedule(id)
            ]);
            setDoctor(doctorRes.data.doctor);
            const existing = scheduleRes.data.schedules || [];
            const next = buildDefault().map((row) => {
                const match = existing.find((item) => item.day === row.day);
                return match
                    ? {
                          day: match.day,
                          startTime: match.startTime,
                          endTime: match.endTime,
                          isActive: match.isActive
                      }
                    : row;
            });
            setRows(next);
            setOriginalRows(next);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load schedule");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const updateRow = (index, updates) => {
        setRows((prev) =>
            prev.map((row, idx) =>
                idx === index ? { ...row, ...updates } : row
            )
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await Promise.all(
                rows.map((row) =>
                    setSchedule({
                        doctorId: id,
                        day: row.day,
                        startTime: row.startTime,
                        endTime: row.endTime,
                        isActive: row.isActive
                    })
                )
            );
            setOriginalRows(rows);
            toast.success("Schedule saved");
            setEditing(false);
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to save schedule"
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setRows(originalRows);
        setEditing(false);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <SkeletonBlock className="h-6 w-48" />
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-64 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="font-medium">Couldn't load schedule</div>
                <div className="mt-1">{error}</div>
                <Link
                    to="/doctors"
                    className="mt-3 inline-block rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                    Back to doctors
                </Link>
            </div>
        );
    }

    const activeRows = rows.filter((row) => row.isActive);

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-xs text-gray-500">
                        <Link to="/doctors" className="hover:text-slate-700">
                            Doctors
                        </Link>
                        <span className="mx-1">/</span>
                        <span>Schedule</span>
                    </div>
                    <h1 className="mt-1 text-xl font-semibold text-gray-900">
                        Schedule Manager
                    </h1>
                    <p className="text-sm text-gray-500">
                        {doctor?.userId?.name
                            ? `${doctor.userId.name} · ${doctor.department}`
                            : "Update weekly availability."}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {!editing ? (
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Edit Schedule
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleCancel}
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
                                {isSaving ? "Saving..." : "Save Schedule"}
                            </button>
                        </>
                    )}
                </div>
            </header>

            {editing ? (
                <div className="rounded-lg border border-gray-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                                    <th className="px-4 py-3">Day</th>
                                    <th className="px-4 py-3">Start</th>
                                    <th className="px-4 py-3">End</th>
                                    <th className="px-4 py-3 text-right">
                                        Available
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map((row, index) => (
                                    <tr
                                        key={row.day}
                                        className={
                                            row.isActive ? "" : "bg-gray-50/30"
                                        }
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {row.day}
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="time"
                                                value={row.startTime}
                                                disabled={!row.isActive}
                                                onChange={(event) =>
                                                    updateRow(index, {
                                                        startTime:
                                                            event.target.value
                                                    })
                                                }
                                                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="time"
                                                value={row.endTime}
                                                disabled={!row.isActive}
                                                onChange={(event) =>
                                                    updateRow(index, {
                                                        endTime:
                                                            event.target.value
                                                    })
                                                }
                                                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <label className="inline-flex cursor-pointer items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={row.isActive}
                                                    onChange={(event) =>
                                                        updateRow(index, {
                                                            isActive:
                                                                event.target
                                                                    .checked
                                                        })
                                                    }
                                                    className="h-4 w-4 rounded border-gray-300 text-slate-700 focus:ring-slate-300"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    {row.isActive
                                                        ? "Available"
                                                        : "Off"}
                                                </span>
                                            </label>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 bg-white">
                    {activeRows.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                                        <th className="px-4 py-3">Day</th>
                                        <th className="px-4 py-3">Hours</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {activeRows.map((row) => (
                                        <tr key={row.day}>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {row.day}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {row.startTime} – {row.endTime}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState
                            title="No availability set"
                            description="This doctor has no active schedule days. Click Edit Schedule to add availability."
                        />
                    )}
                </div>
            )}
        </section>
    );
};

export default ScheduleManager;
