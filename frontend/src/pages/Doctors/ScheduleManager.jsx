import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getDoctorSchedule, setSchedule } from "../../services/doctorService";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const buildDefault = () =>
  daysOfWeek.map((day) => ({ day, startTime: "09:00", endTime: "17:00", isActive: false }));

const ScheduleManager = () => {
  const { id } = useParams();
  const [rows, setRows] = useState(buildDefault);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await getDoctorSchedule(id);
        const existing = response.data.schedules || [];
        const nextRows = buildDefault().map((row) => {
          const match = existing.find((item) => item.day === row.day);
          return match
            ? {
                day: match.day,
                startTime: match.startTime,
                endTime: match.endTime,
                isActive: match.isActive
              }
            : row;
        });
        setRows(nextRows);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load schedule");
      }
    };

    fetchSchedule();
  }, [id]);

  const updateRow = (index, updates) => {
    setRows((prev) => prev.map((row, idx) => (idx === index ? { ...row, ...updates } : row)));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      await Promise.all(
        rows.map((row) =>
          setSchedule({
            doctorId: id,
            day: row.day,
            startTime: row.startTime,
            endTime: row.endTime,
            isActive: row.isActive
          })
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save schedule");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Schedule Manager</h1>
          <p className="text-sm text-gray-600">Update weekly availability.</p>
        </div>
        <Link to="/doctors" className="text-sm font-semibold text-blue-600">
          Back to doctors
        </Link>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">End</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.day} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{row.day}</td>
                <td className="px-4 py-3">
                  <input
                    type="time"
                    value={row.startTime}
                    onChange={(event) => updateRow(index, { startTime: event.target.value })}
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="time"
                    value={row.endTime}
                    onChange={(event) => updateRow(index, { endTime: event.target.value })}
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={row.isActive}
                    onChange={(event) => updateRow(index, { isActive: event.target.checked })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
      >
        {isSaving ? "Saving..." : "Save Schedule"}
      </button>
    </section>
  );
};

export default ScheduleManager;