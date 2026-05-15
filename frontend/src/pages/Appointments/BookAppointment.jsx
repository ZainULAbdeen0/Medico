import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { createAppointment } from "../../services/appointmentService";
import { getPatients } from "../../services/patientService";
import {
    getDoctors,
    getDoctorSchedule
} from "../../services/doctorService";
import { useToast } from "../../context/ToastContext";

const schema = z.object({
    patientId: z.string().min(1, "Select a patient"),
    doctorId: z.string().min(1, "Select a doctor"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    type: z.enum(["general", "follow-up", "emergency"]),
    notes: z.string().optional()
});

const inputBase =
    "w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2";
const inputValid =
    "border-gray-300 focus:border-slate-500 focus:ring-slate-200";
const inputInvalid =
    "border-red-400 focus:border-red-500 focus:ring-red-200";

const BookAppointment = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            patientId: "",
            doctorId: "",
            date: "",
            time: "",
            type: "general",
            notes: ""
        }
    });

    const doctorId = watch("doctorId");

    useEffect(() => {
        const loadOptions = async () => {
            const [patientRes, doctorRes] = await Promise.all([
                getPatients(),
                getDoctors()
            ]);
            setPatients(patientRes.data.patients || []);
            setDoctors(doctorRes.data.doctors || []);
        };

        loadOptions().catch(() => null);
    }, []);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!doctorId) {
                setSchedule([]);
                return;
            }
            const response = await getDoctorSchedule(doctorId);
            setSchedule(response.data.schedules || []);
        };

        fetchSchedule().catch(() => null);
    }, [doctorId]);

    const activeDays = useMemo(
        () => schedule.filter((item) => item.isActive),
        [schedule]
    );

    const onSubmit = async (values) => {
        setServerError("");
        setIsSubmitting(true);
        try {
            const appointmentDate = new Date(`${values.date}T${values.time}`);
            await createAppointment({
                patientId: values.patientId,
                doctorId: values.doctorId,
                appointmentDate,
                type: values.type,
                notes: values.notes || undefined
            });
            toast.success("Appointment booked");
            navigate("/appointments");
        } catch (err) {
            const message =
                err?.response?.data?.message || "Failed to book appointment";
            setServerError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const field = (key) =>
        `${inputBase} ${errors[key] ? inputInvalid : inputValid}`;
    const errorText = (key) =>
        errors[key] ? (
            <p className="mt-1 text-xs text-red-600">{errors[key].message}</p>
        ) : null;

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
                        <span>Book</span>
                    </div>
                    <h1 className="mt-1 text-xl font-semibold text-gray-900">
                        Book Appointment
                    </h1>
                    <p className="text-sm text-gray-500">
                        Create a new appointment for a patient.
                    </p>
                </div>
                <Link
                    to="/appointments"
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </Link>
            </header>

            {serverError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {serverError}
                </div>
            ) : null}

            <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="grid gap-4 lg:grid-cols-3"
            >
                <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 lg:col-span-2">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Patient
                            </label>
                            <select
                                {...register("patientId")}
                                className={field("patientId")}
                            >
                                <option value="">Select patient</option>
                                {patients.map((patient) => (
                                    <option
                                        key={patient._id}
                                        value={patient._id}
                                    >
                                        {patient.name}
                                        {patient.contacts?.phone
                                            ? ` (${patient.contacts.phone})`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                            {errorText("patientId")}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Doctor
                            </label>
                            <select
                                {...register("doctorId")}
                                className={field("doctorId")}
                            >
                                <option value="">Select doctor</option>
                                {doctors.map((doctor) => (
                                    <option
                                        key={doctor._id}
                                        value={doctor._id}
                                    >
                                        {doctor.userId?.name} ·{" "}
                                        {doctor.department}
                                    </option>
                                ))}
                            </select>
                            {errorText("doctorId")}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date
                            </label>
                            <input
                                type="date"
                                {...register("date")}
                                className={field("date")}
                            />
                            {errorText("date")}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Time
                            </label>
                            <input
                                type="time"
                                {...register("time")}
                                className={field("time")}
                            />
                            {errorText("time")}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Type
                            </label>
                            <select
                                {...register("type")}
                                className={field("type")}
                            >
                                <option value="general">General</option>
                                <option value="follow-up">Follow-up</option>
                                <option value="emergency">Emergency</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <textarea
                                rows={3}
                                {...register("notes")}
                                placeholder="Optional"
                                className={field("notes")}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                        <Link
                            to="/appointments"
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {isSubmitting ? "Booking..." : "Book Appointment"}
                        </button>
                    </div>
                </div>

                <aside className="rounded-lg border border-gray-200 bg-white p-5">
                    <h2 className="text-sm font-semibold text-gray-900">
                        Doctor's Availability
                    </h2>
                    {!doctorId ? (
                        <p className="mt-2 text-sm text-gray-500">
                            Select a doctor to view weekly hours.
                        </p>
                    ) : activeDays.length === 0 ? (
                        <p className="mt-2 text-sm text-gray-500">
                            No active schedule recorded for this doctor.
                        </p>
                    ) : (
                        <ul className="mt-3 space-y-2 text-sm">
                            {activeDays.map((day) => (
                                <li
                                    key={day.day}
                                    className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                                >
                                    <span className="text-gray-700">
                                        {day.day}
                                    </span>
                                    <span className="text-gray-500">
                                        {day.startTime} – {day.endTime}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>
            </form>
        </section>
    );
};

export default BookAppointment;
