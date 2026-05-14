import { useMemo, useState } from "react";
import { usePatients } from "../../hooks/usePatients";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const PatientList = () => {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const { patients, totalPages, isLoading, error } = usePatients({
    search: debouncedSearch,
    page
  });

  useMemo(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchValue), 300);
    return () => clearTimeout(handler);
  }, [searchValue]);

  const canCreate = user?.role === "receptionist" || user?.role === "admin";

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="text-sm text-gray-600">Search and manage patient profiles.</p>
        </div>
        {canCreate ? (
          <Link
            to="/patients/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Patient
          </Link>
        ) : null}
      </div>

      <div className="max-w-sm">
        <input
          type="text"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search patients..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {isLoading ? <p className="text-sm text-gray-500">Loading patients...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">DOB</th>
              <th className="px-4 py-3">Blood Group</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{patient.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {patient.dob ? new Date(patient.dob).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-3 text-gray-600">{patient.bloodGroup}</td>
                <td className="px-4 py-3 text-gray-600">{patient.contacts?.phone}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/patients/${patient._id}`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {patients.length === 0 && !isLoading ? (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={5}>
                  No patients found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="rounded-md border border-gray-200 px-3 py-1 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="rounded-md border border-gray-200 px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default PatientList;