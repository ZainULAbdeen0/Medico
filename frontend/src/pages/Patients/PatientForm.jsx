import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    dob: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["male", "female", "other"]),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
    allergies: z.string().optional(),
    phone: z.string().min(7, "Phone must be at least 7 digits"),
    emergency: z.string().optional()
});

const inputBase =
    "w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2";
const inputValid =
    "border-gray-300 focus:border-slate-500 focus:ring-slate-200";
const inputInvalid =
    "border-red-400 focus:border-red-500 focus:ring-red-200";

const buildDefaults = (patient) => ({
    name: patient?.name || "",
    dob: patient?.dob ? patient.dob.split("T")[0] : "",
    gender: patient?.gender || "male",
    bloodGroup: patient?.bloodGroup || "A+",
    allergies: patient?.allergies ? patient.allergies.join(", ") : "",
    phone: patient?.contacts?.phone || "",
    emergency: patient?.contacts?.emergency || ""
});

const PatientForm = ({
    patient,
    onSubmit,
    isSubmitting,
    formId,
    hideSubmit = false,
    submitLabel = "Save Patient"
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: buildDefaults(patient)
    });

    useEffect(() => {
        reset(buildDefaults(patient));
    }, [patient, reset]);

    const handleFormSubmit = (values) => {
        const allergies = values.allergies
            ? values.allergies
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
            : [];
        onSubmit({
            name: values.name,
            dob: values.dob,
            gender: values.gender,
            bloodGroup: values.bloodGroup,
            allergies,
            contacts: {
                phone: values.phone,
                emergency: values.emergency
            }
        });
    };

    const field = (key) => `${inputBase} ${errors[key] ? inputInvalid : inputValid}`;
    const errorText = (key) =>
        errors[key] ? (
            <p className="mt-1 text-xs text-red-600">{errors[key].message}</p>
        ) : null;

    return (
        <form
            id={formId}
            className="space-y-4"
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
        >
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <input
                        {...register("name")}
                        className={field("name")}
                        placeholder="Patient name"
                    />
                    {errorText("name")}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Date of Birth
                    </label>
                    <input
                        type="date"
                        {...register("dob")}
                        className={field("dob")}
                    />
                    {errorText("dob")}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Gender
                    </label>
                    <select {...register("gender")} className={field("gender")}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Blood Group
                    </label>
                    <select
                        {...register("bloodGroup")}
                        className={field("bloodGroup")}
                    >
                        {[
                            "A+",
                            "A-",
                            "B+",
                            "B-",
                            "O+",
                            "O-",
                            "AB+",
                            "AB-"
                        ].map((group) => (
                            <option key={group} value={group}>
                                {group}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Allergies
                    </label>
                    <input
                        {...register("allergies")}
                        className={field("allergies")}
                        placeholder="Comma-separated, e.g. pollen, dust"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Phone
                    </label>
                    <input
                        {...register("phone")}
                        className={field("phone")}
                        placeholder="03001234567"
                    />
                    {errorText("phone")}
                </div>
                <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Emergency Contact
                    </label>
                    <input
                        {...register("emergency")}
                        className={field("emergency")}
                        placeholder="03001112222"
                    />
                </div>
            </div>
            {!hideSubmit ? (
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                    {isSubmitting ? "Saving..." : submitLabel}
                </button>
            ) : null}
        </form>
    );
};

export default PatientForm;
