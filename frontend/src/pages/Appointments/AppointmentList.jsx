import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    getAppointments,
    updateAppointmentStatus
} from "../../services/appointmentService";
import { getDoctors } from "../../services/doctorService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";

const statusBadge = (status) => {
    const map = {
        pending: "bg-amber-50 text-amber-800 border-amber-200",
        confirmed: "bg-slate-100 text-slate-800 border-slate-200",
        completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
        cancelled: "bg-red-50 text-red-800 border-red-200"
    };
    return map[status] || "bg-gray-100 text-gray-700 border-gray-200";
};

const allowedTransitions = (role, currentStatus) => {
    if (role === "doctor") {
        if (currentStatus === "pending") return ["confirmed", "cancelled"];
        if (currentStatus === "confirmed") return ["completed"];
    }
    if (role === "admin" || role === "receptionist") {
        if (currentStatus === "pending") return ["confirmed", "cancelled"];
        if (currentStatus === "confirmed") return ["cancelled"];
    }
    return [];
};

const SkeletonRow = () => (
    <tr>
        {Array.from({ length: 5 }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            </td>
        ))}
    </tr>
);

const AppointmentList = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [filters, setFilters] = useState({
        date: "",
        status: "",
        doctorId: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [editTarget, setEditTarget] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            if (user?.role === "doctor") return;
            const response = await getDoctors();
            setDoctors(response.data.doctors || []);
        };

        fetchDoctors().catch(() => null);
    }, [user]);

    const fetchAppointments = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await getAppointments({
                date: filters.date || undefined,
                status: filters.status || undefined,
                doctorId: filters.doctorId || undefined
            });
            setAppointments(response.data.appointments || []);
        } catch (err) {
            setError(
                err?.response?.data?.message || "Failed to load appointments"
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.date, filters.status, filters.doctorId]);

    const canCreate = user?.role === "admin" || user?.role === "receptionist";

    const transitions = useMemo(
        () => (editTarget ? allowedTransitions(user?.role, editTarget.status) : []),
        [editTarget, user?.role]
    );

    const openEdit = (appointment) => {
        const next = allowedTransitions(user?.role, appointment.status);
        if (next.length === 0) {
            toast.info(
                `No allowed transitions from "${appointment.status}" for your role.`
            );
            return;
        }
        setEditTarget(appointment);
        setNewStatus(next[0]);
    };

    const handleSaveStatus = async () => {
        if (!editTarget || !newStatus) return;
        setIsSaving(true);
        try {
            await updateAppointmentStatus(editTarget._id, newStatus);
            toast.success(`Appointment marked as ${newStatus}`);
            setEditTarget(null);
            fetchAppointments();
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to update status"
            );
        } finally {
            setIsSaving(false);
        }
    };

    const clearFilters = () =>
        setFilters({ date: "", status: "", doctorId: "" });

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Appointments
                    </h1>
                    <p className="text-sm text-gray-500">
                        Track and update upcoming visits.
                    </p>
                </div>
                {canCreate ? (
                    <Link
                        to="/appointments/new"
                        className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Book Appointment
                    </Link>
                ) : null}
            </header>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                            Date
                        </label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(event) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    date: event.target.value
                                }))
                            }
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(event) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    status: event.target.value
                                }))
                            }
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    {user?.role !== "doctor" ? (
                        <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                                Doctor
                            </label>
                            <select
                                value={filters.doctorId}
                                onChange={(event) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        doctorId: event.target.value
                                    }))
                                }
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            >
                                <option value="">All</option>
                                {doctors.map((doctor) => (
                                    <option
                                        key={doctor._id}
                                        value={doctor._id}
                                    >
                                        {doctor.userId?.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : null}
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Clear filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white">
                {error ? (
                    <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                ) : null}

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">Patient</th>
                                <th className="px-4 py-3">Date / Time</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                      <SkeletonRow key={i} />
                                  ))
                                : appointments.map((appt) => {
                                      const canEdit =
                                          allowedTransitions(
                                              user?.role,
                                              appt.status
                                          ).length > 0;
                                      return (
                                          <tr key={appt._id}>
                                              <td className="px-4 py-3 font-medium text-gray-900">
                                                  {appt.patientId?.name || "—"}
                                              </td>
                                              <td className="px-4 py-3 text-gray-600">
                                                  {new Date(
                                                      appt.appointmentDate
                                                  ).toLocaleString()}
                                              </td>
                                              <td className="px-4 py-3 capitalize text-gray-600">
                                                  {appt.type}
                                              </td>
                                              <td className="px-4 py-3">
                                                  <span
                                                      className={`rounded-full border px-3 py-0.5 text-xs font-medium capitalize ${statusBadge(
                                                          appt.status
                                                      )}`}
                                                  >
                                                      {appt.status}
                                                  </span>
                                              </td>
                                              <td className="px-4 py-3 text-right">
                                                  <div className="flex justify-end gap-2">
                                                      <Link
                                                          to={`/appointments/${appt._id}`}
                                                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                      >
                                                          View
                                                      </Link>
                                                      {canEdit ? (
                                                          <button
                                                              type="button"
                                                              onClick={() =>
                                                                  openEdit(
                                                                      appt
                                                                  )
                                                              }
                                                              className="rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                                                          >
                                                              Edit
                                                          </button>
                                                      ) : null}
                                                  </div>
                                              </td>
                                          </tr>
                                      );
                                  })}
                        </tbody>
                    </table>
                </div>

                {!isLoading && appointments.length === 0 ? (
                    <EmptyState
                        title="No appointments found"
                        description={
                            filters.date || filters.status || filters.doctorId
                                ? "Try clearing filters to see all appointments."
                                : "No appointments are scheduled yet."
                        }
                        action={
                            canCreate &&
                            !filters.date &&
                            !filters.status &&
                            !filters.doctorId ? (
                                <Link
                                    to="/appointments/new"
                                    className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    Book Appointment
                                </Link>
                            ) : null
                        }
                    />
                ) : null}
            </div>

            <Modal
                open={!!editTarget}
                onClose={() => (isSaving ? null : setEditTarget(null))}
                title="Update Status"
                description={
                    editTarget
                        ? `${editTarget.patientId?.name} · ${new Date(
                              editTarget.appointmentDate
                          ).toLocaleString()}`
                        : ""
                }
                size="sm"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setEditTarget(null)}
                            disabled={isSaving}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveStatus}
                            disabled={isSaving || !newStatus}
                            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </>
                }
            >
                {editTarget ? (
                    <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                            Current status:{" "}
                            <span
                                className={`ml-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusBadge(
                                    editTarget.status
                                )}`}
                            >
                                {editTarget.status}
                            </span>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                New status
                            </label>
                            <select
                                value={newStatus}
                                onChange={(event) =>
                                    setNewStatus(event.target.value)
                                }
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm capitalize focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            >
                                {transitions.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </section>
    );
};

export default AppointmentList;
