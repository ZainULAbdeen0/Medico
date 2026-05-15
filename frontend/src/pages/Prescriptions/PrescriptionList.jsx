import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAppointments } from "../../services/appointmentService";
import { getPrescriptionByAppointment } from "../../services/prescriptionService";
import EmptyState from "../../components/EmptyState";

const SkeletonRow = () => (
    <tr>
        {Array.from({ length: 5 }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            </td>
        ))}
    </tr>
);

const truncate = (text, max = 80) => {
    if (!text) return "—";
    if (text.length <= max) return text;
    return `${text.slice(0, max)}…`;
};

const PrescriptionList = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const load = async () => {
        setIsLoading(true);
        setError("");
        try {
            const apptRes = await getAppointments({ status: "completed" });
            const appts = apptRes.data.appointments || [];
            const results = await Promise.all(
                appts.map(async (appt) => {
                    try {
                        const res = await getPrescriptionByAppointment(
                            appt._id
                        );
                        if (!res.data?.prescription) return null;
                        return { ...res.data.prescription, appointment: appt };
                    } catch {
                        return null;
                    }
                })
            );
            const list = results.filter(Boolean);
            list.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );
            setPrescriptions(list);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Failed to load prescriptions"
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return prescriptions;
        return prescriptions.filter((p) => {
            const name = (p.patientId?.name || "").toLowerCase();
            const diagnosis = (p.diagnosis || "").toLowerCase();
            return name.includes(q) || diagnosis.includes(q);
        });
    }, [search, prescriptions]);

    return (
        <section className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Prescriptions
                    </h1>
                    <p className="text-sm text-gray-500">
                        Prescriptions you've issued, most recent first.
                    </p>
                </div>
            </header>

            <div className="rounded-lg border border-gray-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full sm:max-w-sm">
                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search by patient or diagnosis..."
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                    </div>
                    <div className="text-xs text-gray-500">
                        {!isLoading && filtered.length > 0
                            ? `${filtered.length} ${
                                  filtered.length === 1
                                      ? "prescription"
                                      : "prescriptions"
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
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Patient</th>
                                <th className="px-4 py-3">Diagnosis</th>
                                <th className="px-4 py-3">Medicines</th>
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
                                : filtered.map((rx) => (
                                      <tr key={rx._id}>
                                          <td className="px-4 py-3 text-gray-600">
                                              {new Date(
                                                  rx.createdAt
                                              ).toLocaleDateString()}
                                          </td>
                                          <td className="px-4 py-3 font-medium text-gray-900">
                                              {rx.patientId?.name || "—"}
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              {truncate(rx.diagnosis)}
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">
                                              {rx.medicines?.length || 0}
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                              <Link
                                                  to={`/prescriptions/${rx._id}`}
                                                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                              >
                                                  View
                                              </Link>
                                          </td>
                                      </tr>
                                  ))}
                        </tbody>
                    </table>
                </div>

                {!isLoading && filtered.length === 0 ? (
                    <EmptyState
                        title="No prescriptions yet"
                        description={
                            search
                                ? `Nothing matches "${search}".`
                                : "Prescriptions you write from a confirmed appointment will appear here."
                        }
                    />
                ) : null}
            </div>
        </section>
    );
};

export default PrescriptionList;
