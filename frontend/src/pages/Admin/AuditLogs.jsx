import { useEffect, useState } from "react";
import { getAuditLogs } from "../../services/auditService";

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

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ action: "", startDate: "", endDate: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const params = {};
    if (filters.action) params.action = filters.action;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    getAuditLogs(params)
      .then((response) => setLogs(response.data.logs))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load audit logs"));
  }, [filters]);

  const handleChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <p className="text-sm text-gray-600">System activity trail.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <select
          value={filters.action}
          onChange={handleChange("action")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All actions</option>
          {ACTIONS.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={handleChange("startDate")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={handleChange("endDate")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="p-3">Timestamp</th>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Resource</th>
              <th className="p-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length ? (
              logs.map((logEntry) => (
                <tr key={logEntry._id} className="border-b border-gray-100 text-gray-600">
                  <td className="p-3">{new Date(logEntry.timestamp).toLocaleString()}</td>
                  <td className="p-3">{logEntry.userId?.name || "-"}</td>
                  <td className="p-3">{logEntry.action}</td>
                  <td className="p-3">{logEntry.resource}</td>
                  <td className="p-3">{logEntry.ipAddress || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-3 text-gray-400">
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AuditLogs;
