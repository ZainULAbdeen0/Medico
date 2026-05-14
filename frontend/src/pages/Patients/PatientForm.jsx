import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  dob: z.string().min(1),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
  allergies: z.string().optional(),
  phone: z.string().min(7),
  emergency: z.string().optional()
});

const PatientForm = ({ patient, onSubmit, isSubmitting }) => {
  const defaultValues = useMemo(
    () => ({
      name: patient?.name || "",
      dob: patient?.dob ? patient.dob.split("T")[0] : "",
      gender: patient?.gender || "male",
      bloodGroup: patient?.bloodGroup || "A+",
      allergies: patient?.allergies ? patient.allergies.join(", ") : "",
      phone: patient?.contacts?.phone || "",
      emergency: patient?.contacts?.emergency || ""
    }),
    [patient]
  );

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues
  });

  const handleFormSubmit = (values) => {
    const allergies = values.allergies
      ? values.allergies.split(",").map((item) => item.trim()).filter(Boolean)
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

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            {...register("name")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Patient name"
          />
          {errors.name ? <p className="text-sm text-red-600">{errors.name.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            {...register("dob")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {errors.dob ? <p className="text-sm text-red-600">{errors.dob.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Gender</label>
          <select
            {...register("gender")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Blood Group</label>
          <select
            {...register("bloodGroup")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
          <label className="text-sm font-medium text-gray-700">Allergies</label>
          <input
            {...register("allergies")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. pollen, dust"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <input
            {...register("phone")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="123456789"
          />
          {errors.phone ? <p className="text-sm text-red-600">{errors.phone.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
          <input
            {...register("emergency")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="0987654321"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
      >
        {isSubmitting ? "Saving..." : "Save Patient"}
      </button>
    </form>
  );
};

export default PatientForm;