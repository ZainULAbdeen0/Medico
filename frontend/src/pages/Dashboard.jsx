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
    Legend,
    CartesianGrid
} from "recharts";
import { getDashboardData } from "../services/analyticsService";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";

const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const STATUS_ORDER = ["pending", "confirmed", "completed", "cancelled"];
const STATUS_LABELS = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled"
};
const STATUS_COLORS = {
    pending: "#94a3b8",
    confirmed: "#64748b",
    completed: "#334155",
    cancelled: "#cbd5e1"
};

const formatToday = () =>
    new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

const SkeletonBlock = ({ className = "" }) => (
    <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <SkeletonBlock className="h-6 w-40" />
            <SkeletonBlock className="h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-lg border border-gray-200 bg-white p-5"
                >
                    <SkeletonBlock className="h-3 w-24" />
                    <SkeletonBlock className="mt-3 h-7 w-16" />
                    <SkeletonBlock className="mt-2 h-3 w-32" />
                </div>
            ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-2">
                <SkeletonBlock className="h-4 w-40" />
                <SkeletonBlock className="mt-4 h-64 w-full" />
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="mt-4 h-64 w-full" />
            </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="mt-4 h-32 w-full" />
        </div>
    </div>
);

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setData(null);
        setError("");
        getDashboardData()
            .then((response) => {
                if (!cancelled) setData(response.data);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(
                        err?.response?.data?.message ||
                            "Failed to load dashboard"
                    );
                }
            });
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="font-medium">Couldn't load the dashboard</div>
                <div className="mt-1 text-red-600">{error}</div>
                <button
                    type="button"
                    onClick={() => setReloadKey((k) => k + 1)}
                    className="mt-3 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!data) {
        return <DashboardSkeleton />;
    }

    const { summary, appointmentsByMonth, statusBreakdown, busiestDoctors } =
        data;

    const monthData = appointmentsByMonth.map((item) => ({
        month: MONTH_NAMES[item.month - 1],
        count: item.count
    }));
    const monthTotal = monthData.reduce((sum, m) => sum + m.count, 0);

    const statusMap = new Map(
        statusBreakdown.map((item) => [item._id, item.count])
    );
    const statusData = STATUS_ORDER.map((status) => ({
        name: STATUS_LABELS[status],
        key: status,
        value: statusMap.get(status) || 0
    }));
    const statusTotal = statusData.reduce((sum, s) => sum + s.value, 0);

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-sm text-gray-500">
                        Overview of hospital operations
                    </p>
                </div>
                <div className="text-xs text-gray-500 sm:text-right">
                    {formatToday()}
                </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Patients"
                    value={summary.totalPatients}
                    caption="Across all departments"
                />
                <StatCard
                    title="Total Doctors"
                    value={summary.totalDoctors}
                    caption="Active practitioners"
                />
                <StatCard
                    title="Today's Appointments"
                    value={summary.todayAppointments}
                    caption="Scheduled for today"
                />
                <StatCard
                    title="Pending"
                    value={summary.pendingAppointments}
                    caption="Awaiting confirmation"
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">
                            Appointments per Month
                        </h2>
                        <span className="text-xs text-gray-500">
                            This year
                        </span>
                    </div>
                    {monthTotal > 0 ? (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={monthData}
                                    margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e5e7eb"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="month"
                                        fontSize={12}
                                        stroke="#6b7280"
                                        tickLine={false}
                                        axisLine={{ stroke: "#e5e7eb" }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        fontSize={12}
                                        stroke="#6b7280"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "#f3f4f6" }}
                                        contentStyle={{
                                            borderRadius: 6,
                                            border: "1px solid #e5e7eb",
                                            fontSize: 12
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#334155"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState
                            title="No appointments yet"
                            description="Once appointments are booked, monthly volume will appear here."
                        />
                    )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h2 className="mb-4 text-sm font-semibold text-gray-900">
                        Status Breakdown
                    </h2>
                    {statusTotal > 0 ? (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={80}
                                        innerRadius={45}
                                        paddingAngle={2}
                                    >
                                        {statusData.map((entry) => (
                                            <Cell
                                                key={entry.key}
                                                fill={STATUS_COLORS[entry.key]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 6,
                                            border: "1px solid #e5e7eb",
                                            fontSize: 12
                                        }}
                                    />
                                    <Legend
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: 12 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState
                            title="No status data"
                            description="Status breakdown will appear once appointments are recorded."
                        />
                    )}
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <h2 className="text-sm font-semibold text-gray-900">
                        Busiest Doctors
                    </h2>
                    <span className="text-xs text-gray-500">
                        By completed appointments
                    </span>
                </div>
                {busiestDoctors.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    <th className="px-5 py-3">Rank</th>
                                    <th className="px-5 py-3">Doctor</th>
                                    <th className="px-5 py-3">
                                        Specialization
                                    </th>
                                    <th className="px-5 py-3 text-right">
                                        Completed
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {busiestDoctors.map((doctor, index) => (
                                    <tr
                                        key={doctor._id}
                                        className="text-gray-700"
                                    >
                                        <td className="px-5 py-3 text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-5 py-3 font-medium text-gray-900">
                                            {doctor.doctorName}
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">
                                            {doctor.specialization}
                                        </td>
                                        <td className="px-5 py-3 text-right font-medium text-gray-900">
                                            {doctor.totalAppointments}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        title="No completed appointments yet"
                        description="Doctor activity will appear here once appointments are completed."
                    />
                )}
            </div>
        </section>
    );
};

export default Dashboard;
