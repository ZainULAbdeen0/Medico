import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDoctors } from "../../services/doctorService";
import { useAuth } from "../../context/AuthContext";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [department, setDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getDoctors(department ? { department } : undefined);
        setDoctors(response.data.doctors || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load doctors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [department]);

  const canCreate = user?.role === "admin";

  const departmentOptions = Array.from(
    new Set(doctors.map((doctor) => doctor.department).filter(Boolean))
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Doctors</h1>
          <p className="text-sm text-gray-600">Manage doctor profiles and schedules.</p>
        </div>
        {canCreate ? (
          <Link
            to="/doctors/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Doctor
          </Link>
        ) : null}
      </div>

      <div className="max-w-xs">
        <label className="text-sm font-medium text-gray-700">Department</label>
        <select
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All departments</option>
          {departmentOptions.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? <p className="text-sm text-gray-500">Loading doctors...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Specialization</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor._id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {doctor.userId?.name || "-"}
                </td>
                <td className="px-4 py-3 text-gray-600">{doctor.specialization}</td>
                <td className="px-4 py-3 text-gray-600">{doctor.department}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/doctors/${doctor._id}/schedule`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Schedule
                  </Link>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  No doctors found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DoctorList;