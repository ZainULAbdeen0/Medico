import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getDoctorUsers } from "../../services/doctorService";

const schema = z.object({
  userId: z.string().min(1),
  specialization: z.string().min(2),
  department: z.string().min(2),
  qualifications: z.string().optional(),
  bio: z.string().optional()
});

const DoctorForm = ({ onSubmit, isSubmitting }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getDoctorUsers();
        setUsers(response.data.users || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load doctor users");
      }
    };

    fetchUsers();
  }, []);

  const handleFormSubmit = (values) => {
    const qualifications = values.qualifications
      ? values.qualifications.split(",").map((item) => item.trim()).filter(Boolean)
      : [];
    onSubmit({
      userId: values.userId,
      specialization: values.specialization,
      department: values.department,
      qualifications,
      bio: values.bio
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <div>
        <label className="text-sm font-medium text-gray-700">Doctor User</label>
        <select
          {...register("userId")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select a doctor user</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
        {errors.userId ? <p className="text-sm text-red-600">{errors.userId.message}</p> : null}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Specialization</label>
        <input
          {...register("specialization")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors.specialization ? (
          <p className="text-sm text-red-600">{errors.specialization.message}</p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Department</label>
        <input
          {...register("department")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors.department ? (
          <p className="text-sm text-red-600">{errors.department.message}</p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Qualifications</label>
        <input
          {...register("qualifications")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="e.g. MBBS, FCPS"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Bio</label>
        <textarea
          {...register("bio")}
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
      >
        {isSubmitting ? "Saving..." : "Save Doctor"}
      </button>
    </form>
  );
};

export default DoctorForm;