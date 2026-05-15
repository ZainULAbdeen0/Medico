import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getDoctorUsers } from "../../services/doctorService";

const baseSchema = {
    specialization: z.string().min(2, "Specialization is required"),
    department: z.string().min(2, "Department is required"),
    qualifications: z.string().optional(),
    bio: z.string().optional()
};

const createSchema = z.object({
    userId: z.string().min(1, "Select a doctor user"),
    ...baseSchema
});

const editSchema = z.object(baseSchema);

const inputBase =
    "w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2";
const inputValid =
    "border-gray-300 focus:border-slate-500 focus:ring-slate-200";
const inputInvalid =
    "border-red-400 focus:border-red-500 focus:ring-red-200";

const buildDefaults = (doctor) => ({
    userId: doctor?.userId?._id || doctor?.userId || "",
    specialization: doctor?.specialization || "",
    department: doctor?.department || "",
    qualifications: doctor?.qualifications
        ? doctor.qualifications.join(", ")
        : "",
    bio: doctor?.bio || ""
});

const DoctorForm = ({
    doctor,
    onSubmit,
    isSubmitting,
    formId,
    hideSubmit = false,
    submitLabel = "Save Doctor"
}) => {
    const isEdit = Boolean(doctor);
    const [users, setUsers] = useState([]);
    const [loadError, setLoadError] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(isEdit ? editSchema : createSchema),
        defaultValues: buildDefaults(doctor)
    });

    useEffect(() => {
        reset(buildDefaults(doctor));
    }, [doctor, reset]);

    useEffect(() => {
        if (isEdit) return;
        const fetchUsers = async () => {
            try {
                const response = await getDoctorUsers();
                setUsers(response.data.users || []);
            } catch (err) {
                setLoadError(
                    err?.response?.data?.message ||
                        "Failed to load doctor users"
                );
            }
        };

        fetchUsers();
    }, [isEdit]);

    const handleFormSubmit = (values) => {
        const qualifications = values.qualifications
            ? values.qualifications
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
            : [];
        const payload = {
            specialization: values.specialization,
            department: values.department,
            qualifications,
            bio: values.bio
        };
        if (!isEdit) payload.userId = values.userId;
        onSubmit(payload);
    };

    const field = (key) =>
        `${inputBase} ${errors[key] ? inputInvalid : inputValid}`;
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
            {loadError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {loadError}
                </div>
            ) : null}

            {!isEdit ? (
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Doctor User
                    </label>
                    <select
                        {...register("userId")}
                        className={field("userId")}
                    >
                        <option value="">Select a doctor user</option>
                        {users.map((user) => (
                            <option key={user._id} value={user._id}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                    {errorText("userId")}
                </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Specialization
                    </label>
                    <input
                        {...register("specialization")}
                        className={field("specialization")}
                        placeholder="e.g. Cardiologist"
                    />
                    {errorText("specialization")}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Department
                    </label>
                    <input
                        {...register("department")}
                        className={field("department")}
                        placeholder="e.g. Cardiology"
                    />
                    {errorText("department")}
                </div>
                <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Qualifications
                    </label>
                    <input
                        {...register("qualifications")}
                        className={field("qualifications")}
                        placeholder="Comma-separated, e.g. MBBS, FCPS"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Bio
                    </label>
                    <textarea
                        {...register("bio")}
                        rows={3}
                        className={field("bio")}
                        placeholder="Short biography"
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

export default DoctorForm;
