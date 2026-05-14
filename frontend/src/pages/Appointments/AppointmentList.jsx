import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAppointments } from "../../services/appointmentService";
import { getDoctors } from "../../services/doctorService";
import { useAuth } from "../../context/AuthContext";

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700"
};

const AppointmentList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({ date: "", status: "", doctorId: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      if (user?.role === "doctor") return;
      const response = await getDoctors();
      setDoctors(response.data.doctors || []);
    };

    fetchDoctors().catch(() => null);
  }, [user]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getAppointments({
          date: filters.date || undefined,
          status: filters.status || undefined,
          doctorId: filters.doctorId || undefined
        });
        setAppointments(response.data.appointments || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load appointments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [filters]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Appointments</h1>
          <p className="text-sm text-gray-600">Track upcoming visits.</p>
        </div>
        {(user?.role === "admin" || user?.role === "receptionist") && (
          <Link
            to="/appointments/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Book Appointment
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {user?.role !== "doctor" && (
          <div>
            <label className="text-sm font-medium text-gray-700">Doctor</label>
            <select
              value={filters.doctorId}
              onChange={(event) => setFilters((prev) => ({ ...prev, doctorId: event.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.userId?.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading ? <p className="text-sm text-gray-500">Loading appointments...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Date/Time</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt._id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {appt.patientId?.name || "-"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(appt.appointmentDate).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-600">{appt.type}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusColors[appt.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {appt.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/appointments/${appt._id}`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  No appointments found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AppointmentList;