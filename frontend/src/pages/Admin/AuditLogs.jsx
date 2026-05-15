import { useEffect, useState } from "react";
import { getAuditLogs } from "../../services/auditService";
import EmptyState from "../../components/EmptyState";

const ACTIONS = [
    "CREATE_PATIENT",
    "UPDATE_PATIENT",
    "DELETE_PATIENT",
    "CREATE_APPOINTMENT",
    "UPDATE_APPOINTMENT_STATUS",
    "CREATE_PRESCRIPTION",
    "USER_LOGIN",
    "USER_LOGOUT"
];

const ACTION_TONES = {
    CREATE_PATIENT: "bg-emerald-50 text-emerald-800 border-emerald-200",
    UPDATE_PATIENT: "bg-slate-100 text-slate-800 border-slate-200",
    DELETE_PATIENT: "bg-red-50 text-red-800 border-red-200",
    CREATE_APPOINTMENT: "bg-emerald-50 text-emerald-800 border-emerald-200",
    UPDATE_APPOINTMENT_STATUS:
        "bg-slate-100 text-slate-800 border-slate-200",
    CREATE_PRESCRIPTION: "bg-emerald-50 text-emerald-800 border-emerald-200",
    USER_LOGIN: "bg-slate-100 text-slate-800 border-slate-200",
    USER_LOGOUT: "bg-gray-100 text-gray-700 border-gray-200"
};

const SkeletonRow = () => (
    <tr>
        {Array.from({ length: 5 }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            </td>
        ))}
    </tr>
);

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [filters, setFilters] = useState({
        action: "",
        startDate: "",
        endDate: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const params = {};
        if (filters.action) params.action = filters.action;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        setIsLoading(true);
        setError("");
        getAuditLogs(params)
            .then((response) => setLogs(response.data.logs || []))
            .catch((err) =>
                setError(
                    err?.response?.data?.message ||
                        "Failed to load audit logs"
                )
            )
            .finally(() => setIsLoading(false));
    }, [filters]);

    const clearFilters = () =>
        setFilters({ action: "", startDate: "", endDate: "" });

    const handleChange = (field) => (event) => {
        setFilters((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const hasActiveFilters =
        filters.action || filters.startDate || filters.endDate;

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-xl font-semibold text-gray-900">
                    Audit Logs
                </h1>
                <p className="text-sm text-gray-500">
                    Read-only system activity trail.
                </p>
            </header>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                            Action
                        </label>
                        <select
                            value={filters.action}
                            onChange={handleChange("action")}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            <option value="">All actions</option>
                            {ACTIONS.map((action) => (
                                <option key={action} value={action}>
                                    {action}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                            From
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={handleChange("startDate")}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                            To
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={handleChange("endDate")}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Clear filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-4 py-3">
                    <div className="text-xs text-gray-500">
                        {logs.length > 0
                            ? `${logs.length} ${
                                  logs.length === 1 ? "entry" : "entries"
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
                                <th className="px-4 py-3">Timestamp</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Action</th>
                                <th className="px-4 py-3">Resource</th>
                                <th className="px-4 py-3">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                      <SkeletonRow key={i} />
                                  ))
                                : logs.map((entry) => (
                                      <tr key={entry._id}>
                                          <td className="px-4 py-3 text-gray-600">
                                              {new Date(
                                                  entry.timestamp
                                              ).toLocaleString()}
                                          </td>
                                          <td className="px-4 py-3 font-medium text-gray-900">
                                              {entry.userId?.name || "—"}
                                          </td>
                                          <td className="px-4 py-3">
                                              <span
                                                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                                      ACTION_TONES[
                                                          entry.action
                                                      ] ||
                                                      "bg-gray-100 text-gray-700 border-gray-200"
                                                  }`}
                                              >
                                                  {entry.action}
                                              </span>
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              {entry.resource}
                                          </td>
                                          <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                              {entry.ipAddress || "—"}
                                          </td>
                                      </tr>
                                  ))}
                        </tbody>
                    </table>
                </div>

                {!isLoading && logs.length === 0 ? (
                    <EmptyState
                        title="No audit logs"
                        description={
                            hasActiveFilters
                                ? "No entries match the current filters."
                                : "No system activity has been recorded yet."
                        }
                    />
                ) : null}
            </div>
        </section>
    );
};

export default AuditLogs;
