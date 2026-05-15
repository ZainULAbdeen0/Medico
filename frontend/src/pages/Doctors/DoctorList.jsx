import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDoctors, updateDoctor } from "../../services/doctorService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import DoctorForm from "./DoctorForm";

const SkeletonRow = () => (
    <tr>
        {Array.from({ length: 5 }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            </td>
        ))}
    </tr>
);

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [department, setDepartment] = useState("");
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [editTarget, setEditTarget] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useAuth();
    const toast = useToast();

    const fetchDoctors = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await getDoctors(
                department ? { department } : undefined
            );
            setDoctors(response.data.doctors || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load doctors");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [department]);

    const canManage = user?.role === "admin";

    const departmentOptions = Array.from(
        new Set(doctors.map((doctor) => doctor.department).filter(Boolean))
    );

    const filteredDoctors = search
        ? doctors.filter((doctor) => {
              const name = (doctor.userId?.name || "").toLowerCase();
              const spec = (doctor.specialization || "").toLowerCase();
              const q = search.toLowerCase();
              return name.includes(q) || spec.includes(q);
          })
        : doctors;

    const handleSave = async (payload) => {
        if (!editTarget) return;
        setIsSaving(true);
        try {
            await updateDoctor(editTarget._id, payload);
            toast.success(`Updated ${editTarget.userId?.name || "doctor"}`);
            setEditTarget(null);
            fetchDoctors();
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to update doctor"
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Doctors
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage doctor profiles and weekly schedules.
                    </p>
                </div>
                {canManage ? (
                    <Link
                        to="/doctors/new"
                        className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Add Doctor
                    </Link>
                ) : null}
            </header>

            <div className="rounded-lg border border-gray-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search name or specialization"
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 sm:w-64"
                        />
                        <select
                            value={department}
                            onChange={(event) =>
                                setDepartment(event.target.value)
                            }
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 sm:w-56"
                        >
                            <option value="">All departments</option>
                            {departmentOptions.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="text-xs text-gray-500">
                        {filteredDoctors.length > 0
                            ? `${filteredDoctors.length} ${
                                  filteredDoctors.length === 1
                                      ? "doctor"
                                      : "doctors"
                              }`
                            : null}
                    </div>
                </div>

                {error ? (
                    <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                ) : null}

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Specialization</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">Qualifications</th>
                                <th className="px-4 py-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading
                                ? Array.from({ length: 4 }).map((_, i) => (
                                      <SkeletonRow key={i} />
                                  ))
                                : filteredDoctors.map((doctor) => (
                                      <tr key={doctor._id}>
                                          <td className="px-4 py-3 font-medium text-gray-900">
                                              {doctor.userId?.name || "—"}
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              {doctor.specialization}
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              {doctor.department}
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              {doctor.qualifications?.length
                                                  ? doctor.qualifications.join(
                                                        ", "
                                                    )
                                                  : "—"}
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                              <div className="flex justify-end gap-2">
                                                  {canManage ? (
                                                      <Link
                                                          to={`/doctors/${doctor._id}/schedule`}
                                                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                      >
                                                          Schedule
                                                      </Link>
                                                  ) : null}
                                                  {canManage ? (
                                                      <button
                                                          type="button"
                                                          onClick={() =>
                                                              setEditTarget(
                                                                  doctor
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
                                  ))}
                        </tbody>
                    </table>
                </div>

                {!isLoading && filteredDoctors.length === 0 ? (
                    <EmptyState
                        title="No doctors found"
                        description={
                            search || department
                                ? "Try clearing filters to see all doctors."
                                : "No doctor profiles yet."
                        }
                        action={
                            canManage && !search && !department ? (
                                <Link
                                    to="/doctors/new"
                                    className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    Add Doctor
                                </Link>
                            ) : null
                        }
                    />
                ) : null}
            </div>

            <Modal
                open={!!editTarget}
                onClose={() => (isSaving ? null : setEditTarget(null))}
                title="Edit Doctor"
                description={editTarget?.userId?.name}
                size="lg"
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
                            type="submit"
                            form="edit-doctor-form"
                            disabled={isSaving}
                            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </>
                }
            >
                {editTarget ? (
                    <DoctorForm
                        doctor={editTarget}
                        onSubmit={handleSave}
                        isSubmitting={isSaving}
                        formId="edit-doctor-form"
                        hideSubmit
                    />
                ) : null}
            </Modal>
        </section>
    );
};

export default DoctorList;
