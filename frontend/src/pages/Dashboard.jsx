import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { getDashboardData } from "../services/analyticsService";
import StatCard from "../components/StatCard";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const STATUS_ORDER = ["pending", "confirmed", "completed", "cancelled"];
const STATUS_COLORS = {
  pending: "#9ca3af",
  confirmed: "#60a5fa",
  completed: "#2563eb",
  cancelled: "#d1d5db"
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardData()
      .then((response) => setData(response.data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load dashboard"));
  }, []);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-gray-500">Loading dashboard...</p>;
  }

  const { summary, appointmentsByMonth, statusBreakdown, busiestDoctors } = data;

  const monthData = appointmentsByMonth.map((item) => ({
    month: MONTH_NAMES[item.month - 1],
    count: item.count
  }));

  const statusMap = new Map(statusBreakdown.map((item) => [item._id, item.count]));
  const statusData = STATUS_ORDER.map((status) => ({
    name: status,
    value: statusMap.get(status) || 0
  }));

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Patients" value={summary.totalPatients} />
        <StatCard title="Total Doctors" value={summary.totalDoctors} />
        <StatCard title="Today's Appointments" value={summary.todayAppointments} />
        <StatCard title="Pending" value={summary.pendingAppointments} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700">Appointments per Month</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData}>
                <XAxis dataKey="month" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-700">Status Breakdown</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700">Busiest Doctors</h2>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2">Rank</th>
              <th className="py-2">Doctor</th>
              <th className="py-2">Specialization</th>
              <th className="py-2">Completed</th>
            </tr>
          </thead>
          <tbody>
            {busiestDoctors.length ? (
              busiestDoctors.map((doctor, index) => (
                <tr key={doctor._id} className="border-b border-gray-100 text-gray-600">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">{doctor.doctorName}</td>
                  <td className="py-2">{doctor.specialization}</td>
                  <td className="py-2">{doctor.totalAppointments}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-3 text-gray-400">
                  No completed appointments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dashboard;
