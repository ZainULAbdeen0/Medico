import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePatients } from "../../hooks/usePatients";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { updatePatient } from "../../services/patientService";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import PatientForm from "./PatientForm";

const SkeletonRow = () => (
    <tr className="border-t border-gray-100">
        {Array.from({ length: 5 }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            </td>
        ))}
    </tr>
);

const PatientList = () => {
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [editTarget, setEditTarget] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useAuth();
    const toast = useToast();
    const { patients, totalPages, total, isLoading, error, refresh } =
        usePatients({ search: debouncedSearch, page });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchValue);
            setPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchValue]);

    const canManage = user?.role === "receptionist" || user?.role === "admin";

    const handleSave = async (payload) => {
        if (!editTarget) return;
        setIsSaving(true);
        try {
            await updatePatient(editTarget._id, payload);
            toast.success(`Updated ${payload.name}`);
            setEditTarget(null);
            refresh();
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to update patient"
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
                        Patients
                    </h1>
                    <p className="text-sm text-gray-500">
                        Search and manage patient profiles.
                    </p>
                </div>
                {canManage ? (
                    <Link
                        to="/patients/new"
                        className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Add Patient
                    </Link>
                ) : null}
            </header>

            <div className="rounded-lg border border-gray-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full sm:max-w-sm">
                        <input
                            type="search"
                            value={searchValue}
                            onChange={(event) =>
                                setSearchValue(event.target.value)
                            }
                            placeholder="Search by name or phone..."
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                    </div>
                    <div className="text-xs text-gray-500">
                        {total > 0
                            ? `${total} ${total === 1 ? "patient" : "patients"}`
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
                                <th className="px-4 py-3">DOB</th>
                                <th className="px-4 py-3">Blood Group</th>
                                <th className="px-4 py-3">Phone</th>
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
                                : patients.map((patient) => (
                                      <tr key={patient._id}>
                                          <td className="px-4 py-3 font-medium text-gray-900">
                                              {patient.name}
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              {patient.dob
                                                  ? new Date(
                                                        patient.dob
                                                    ).toLocaleDateString()
                                                  : "—"}
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              {patient.bloodGroup || "—"}
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              {patient.contacts?.phone || "—"}
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                              <div className="flex justify-end gap-2">
                                                  <Link
                                                      to={`/patients/${patient._id}`}
                                                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                  >
                                                      View
                                                  </Link>
                                                  {canManage ? (
                                                      <button
                                                          type="button"
                                                          onClick={() =>
                                                              setEditTarget(
                                                                  patient
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

                {!isLoading && patients.length === 0 ? (
                    <EmptyState
                        title="No patients found"
                        description={
                            debouncedSearch
                                ? `Nothing matches "${debouncedSearch}".`
                                : "No patient records yet. Add the first one to get started."
                        }
                        action={
                            canManage && !debouncedSearch ? (
                                <Link
                                    to="/patients/new"
                                    className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    Add Patient
                                </Link>
                            ) : null
                        }
                    />
                ) : null}

                {!isLoading && patients.length > 0 ? (
                    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
                        <button
                            type="button"
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-xs text-gray-500">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setPage((prev) => Math.min(prev + 1, totalPages))
                            }
                            disabled={page === totalPages}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                ) : null}
            </div>

            <Modal
                open={!!editTarget}
                onClose={() => (isSaving ? null : setEditTarget(null))}
                title="Edit Patient"
                description={editTarget?.name}
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
                            form="edit-patient-form"
                            disabled={isSaving}
                            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </>
                }
            >
                {editTarget ? (
                    <PatientForm
                        patient={editTarget}
                        onSubmit={handleSave}
                        isSubmitting={isSaving}
                        formId="edit-patient-form"
                        hideSubmit
                    />
                ) : null}
            </Modal>
        </section>
    );
};

export default PatientList;
