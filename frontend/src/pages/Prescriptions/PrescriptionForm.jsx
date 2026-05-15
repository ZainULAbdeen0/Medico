import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getAppointment } from "../../services/appointmentService";
import { createPrescription } from "../../services/prescriptionService";
import { useToast } from "../../context/ToastContext";

const medicineSchema = z.object({
    name: z.string().min(1, "Required"),
    dosage: z.string().min(1, "Required"),
    frequency: z.string().min(1, "Required"),
    duration: z.string().min(1, "Required")
});

const schema = z.object({
    medicines: z.array(medicineSchema).min(1, "Add at least one medicine"),
    diagnosis: z.string().min(2, "Diagnosis is required"),
    notes: z.string().optional()
});

const inputBase =
    "w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2";
const inputValid =
    "border-gray-300 focus:border-slate-500 focus:ring-slate-200";
const inputInvalid =
    "border-red-400 focus:border-red-500 focus:ring-red-200";

const PrescriptionForm = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [appointment, setAppointment] = useState(null);
    const [loadError, setLoadError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
            diagnosis: "",
            notes: ""
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "medicines"
    });

    useEffect(() => {
        getAppointment(appointmentId)
            .then((response) => setAppointment(response.data.appointment))
            .catch((err) =>
                setLoadError(
                    err?.response?.data?.message ||
                        "Failed to load appointment"
                )
            );
    }, [appointmentId]);

    const onSubmit = async (values) => {
        if (!appointment) return;
        setIsSubmitting(true);
        try {
            await createPrescription({
                appointmentId,
                patientId:
                    appointment.patientId?._id || appointment.patientId,
                medicines: values.medicines,
                diagnosis: values.diagnosis,
                notes: values.notes || undefined
            });
            toast.success("Prescription saved");
            navigate(`/appointments/${appointmentId}`);
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                    "Failed to create prescription"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadError && !appointment) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {loadError}
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="space-y-3">
                <div className="h-6 w-56 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                <div className="h-40 w-full animate-pulse rounded bg-gray-200" />
            </div>
        );
    }

    const medicineFieldClass = (index, key) => {
        const fieldError = errors.medicines?.[index]?.[key];
        return `${inputBase} ${fieldError ? inputInvalid : inputValid}`;
    };

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-xs text-gray-500">
                        <Link
                            to={`/appointments/${appointmentId}`}
                            className="hover:text-slate-700"
                        >
                            Appointment
                        </Link>
                        <span className="mx-1">/</span>
                        <span>Prescription</span>
                    </div>
                    <h1 className="mt-1 text-xl font-semibold text-gray-900">
                        Write Prescription
                    </h1>
                    <p className="text-sm text-gray-500">
                        {appointment.patientId?.name} ·{" "}
                        {new Date(
                            appointment.appointmentDate
                        ).toLocaleString()}
                    </p>
                </div>
                <Link
                    to={`/appointments/${appointmentId}`}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </Link>
            </header>

            <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-5"
            >
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">
                            Medicines
                        </h2>
                        <button
                            type="button"
                            onClick={() =>
                                append({
                                    name: "",
                                    dosage: "",
                                    frequency: "",
                                    duration: ""
                                })
                            }
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Add medicine
                        </button>
                    </div>

                    <div className="mt-3 space-y-3">
                        {fields.map((row, index) => (
                            <div
                                key={row.id}
                                className="grid gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 md:grid-cols-5"
                            >
                                <input
                                    {...register(`medicines.${index}.name`)}
                                    placeholder="Name"
                                    className={medicineFieldClass(
                                        index,
                                        "name"
                                    )}
                                />
                                <input
                                    {...register(
                                        `medicines.${index}.dosage`
                                    )}
                                    placeholder="Dosage (500mg)"
                                    className={medicineFieldClass(
                                        index,
                                        "dosage"
                                    )}
                                />
                                <input
                                    {...register(
                                        `medicines.${index}.frequency`
                                    )}
                                    placeholder="Frequency (2x daily)"
                                    className={medicineFieldClass(
                                        index,
                                        "frequency"
                                    )}
                                />
                                <input
                                    {...register(
                                        `medicines.${index}.duration`
                                    )}
                                    placeholder="Duration (7 days)"
                                    className={medicineFieldClass(
                                        index,
                                        "duration"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    {errors.medicines && !Array.isArray(errors.medicines) ? (
                        <p className="mt-2 text-xs text-red-600">
                            {errors.medicines.message}
                        </p>
                    ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Diagnosis
                        </label>
                        <textarea
                            {...register("diagnosis")}
                            rows={4}
                            className={`${inputBase} ${
                                errors.diagnosis ? inputInvalid : inputValid
                            }`}
                            placeholder="Primary diagnosis"
                        />
                        {errors.diagnosis ? (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.diagnosis.message}
                            </p>
                        ) : null}
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Notes
                        </label>
                        <textarea
                            {...register("notes")}
                            rows={4}
                            className={`${inputBase} ${
                                errors.notes ? inputInvalid : inputValid
                            }`}
                            placeholder="Optional notes for the patient"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Link
                        to={`/appointments/${appointmentId}`}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        {isSubmitting ? "Saving..." : "Save Prescription"}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default PrescriptionForm;
