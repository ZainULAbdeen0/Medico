import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    getAppointment,
    updateAppointmentStatus
} from "../../services/appointmentService";
import { getPrescriptionByAppointment } from "../../services/prescriptionService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const statusBadge = (status) => {
    const map = {
        pending: "bg-amber-50 text-amber-800 border-amber-200",
        confirmed: "bg-slate-100 text-slate-800 border-slate-200",
        completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
        cancelled: "bg-red-50 text-red-800 border-red-200"
    };
    return map[status] || "bg-gray-100 text-gray-700 border-gray-200";
};

const SkeletonBlock = ({ className = "" }) => (
    <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="text-right font-medium text-gray-900">
            {value || "—"}
        </span>
    </div>
);

const AppointmentDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const toast = useToast();
    const [appointment, setAppointment] = useState(null);
    const [prescription, setPrescription] = useState(null);
    const [error, setError] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchAppointment = async () => {
        try {
            const response = await getAppointment(id);
            setAppointment(response.data.appointment);
        } catch (err) {
            setError(
                err?.response?.data?.message || "Failed to load appointment"
            );
        }
    };

    useEffect(() => {
        setAppointment(null);
        setError("");
        fetchAppointment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        getPrescriptionByAppointment(id)
            .then((response) => setPrescription(response.data.prescription))
            .catch(() => setPrescription(null));
    }, [id]);

    const handleStatus = async (status) => {
        setIsUpdating(true);
        try {
            await updateAppointmentStatus(id, status);
            toast.success(`Marked as ${status}`);
            await fetchAppointment();
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to update status"
            );
        } finally {
            setIsUpdating(false);
        }
    };

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="font-medium">Couldn't load appointment</div>
                <div className="mt-1">{error}</div>
                <Link
                    to="/appointments"
                    className="mt-3 inline-block rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                    Back to list
                </Link>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="space-y-4">
                <SkeletonBlock className="h-6 w-56" />
                <SkeletonBlock className="h-4 w-40" />
                <div className="grid gap-4 md:grid-cols-2">
                    <SkeletonBlock className="h-28 w-full" />
                    <SkeletonBlock className="h-28 w-full" />
                </div>
                <SkeletonBlock className="h-32 w-full" />
            </div>
        );
    }

    const canConfirm =
        user?.role === "doctor" && appointment.status === "pending";
    const canComplete =
        user?.role === "doctor" && appointment.status === "confirmed";
    const canCancel =
        (user?.role === "admin" || user?.role === "receptionist") &&
        (appointment.status === "pending" ||
            appointment.status === "confirmed");

    const idShort = appointment._id.slice(-6).toUpperCase();

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-xs text-gray-500">
                        <Link
                            to="/appointments"
                            className="hover:text-slate-700"
                        >
                            Appointments
                        </Link>
                        <span className="mx-1">/</span>
                        <span>#{idShort}</span>
                    </div>
                    <h1 className="mt-1 flex flex-wrap items-center gap-3 text-xl font-semibold text-gray-900">
                        Appointment #{idShort}
                        <span
                            className={`rounded-full border px-3 py-0.5 text-xs font-medium capitalize ${statusBadge(
                                appointment.status
                            )}`}
                        >
                            {appointment.status}
                        </span>
                    </h1>
                    <p className="text-sm text-gray-500">
                        {new Date(
                            appointment.appointmentDate
                        ).toLocaleString()}
                    </p>
                </div>
                <Link
                    to="/appointments"
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Back to list
                </Link>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h2 className="mb-2 text-sm font-semibold text-gray-900">
                        Patient
                    </h2>
                    <div className="divide-y divide-gray-100">
                        <InfoRow
                            label="Name"
                            value={appointment.patientId?.name}
                        />
                        <InfoRow
                            label="Blood Group"
                            value={appointment.patientId?.bloodGroup}
                        />
                    </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h2 className="mb-2 text-sm font-semibold text-gray-900">
                        Doctor
                    </h2>
                    <div className="divide-y divide-gray-100">
                        <InfoRow
                            label="Name"
                            value={appointment.doctorId?.userId?.name}
                        />
                        <InfoRow
                            label="Specialization"
                            value={appointment.doctorId?.specialization}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="mb-2 text-sm font-semibold text-gray-900">
                    Visit Details
                </h2>
                <div className="divide-y divide-gray-100">
                    <InfoRow
                        label="Date / Time"
                        value={new Date(
                            appointment.appointmentDate
                        ).toLocaleString()}
                    />
                    <InfoRow
                        label="Type"
                        value={
                            appointment.type
                                ? appointment.type
                                      .charAt(0)
                                      .toUpperCase() +
                                  appointment.type.slice(1)
                                : null
                        }
                    />
                    <InfoRow label="Notes" value={appointment.notes} />
                </div>
            </div>

            {canConfirm || canComplete || canCancel ? (
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h2 className="mb-3 text-sm font-semibold text-gray-900">
                        Update Status
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {canConfirm ? (
                            <button
                                type="button"
                                onClick={() => handleStatus("confirmed")}
                                disabled={isUpdating}
                                className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                                Confirm
                            </button>
                        ) : null}
                        {canComplete ? (
                            <button
                                type="button"
                                onClick={() => handleStatus("completed")}
                                disabled={isUpdating}
                                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                            >
                                Mark Completed
                            </button>
                        ) : null}
                        {canCancel ? (
                            <button
                                type="button"
                                onClick={() => handleStatus("cancelled")}
                                disabled={isUpdating}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                            >
                                Cancel Appointment
                            </button>
                        ) : null}
                    </div>
                </div>
            ) : null}

            <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">
                    Prescription
                </h2>
                {prescription ? (
                    <Link
                        to={`/prescriptions/${prescription._id}`}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        View Prescription
                    </Link>
                ) : user?.role === "doctor" &&
                  appointment.status === "confirmed" ? (
                    <Link
                        to={`/appointments/${appointment._id}/prescribe`}
                        className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Write Prescription
                    </Link>
                ) : (
                    <p className="text-sm text-gray-500">
                        No prescription recorded for this appointment.
                    </p>
                )}
            </div>
        </section>
    );
};

export default AppointmentDetail;
