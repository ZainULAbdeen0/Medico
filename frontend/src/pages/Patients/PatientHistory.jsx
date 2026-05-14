import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPatientHistory } from "../../services/historyService";

const statusCount = (stats, status) =>
  stats.find((item) => item._id === status)?.count || 0;

const PatientHistory = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPatientHistory(id)
      .then((response) => setData(response.data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load history"));
  }, [id]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-gray-500">Loading history...</p>;
  }

  const { patient, appointmentStats, history } = data;
  const total = appointmentStats.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{patient.name}</h1>
          <p className="text-sm text-gray-600">Full medical history</p>
        </div>
        <Link to={`/patients/${id}`} className="text-sm font-semibold text-blue-600">
          Back to patient
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700">Summary</h2>
        <div className="mt-2 grid gap-1 text-sm text-gray-600 md:grid-cols-2">
          <div>Date of Birth: {new Date(patient.dob).toLocaleDateString()}</div>
          <div>Blood Group: {patient.bloodGroup}</div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {patient.allergies?.length ? (
            patient.allergies.map((item) => (
              <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                {item}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No allergies recorded.</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 p-4 text-sm">
          <div className="text-gray-500">Total appointments</div>
          <div className="text-xl font-semibold text-gray-800">{total}</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 text-sm">
          <div className="text-gray-500">Completed</div>
          <div className="text-xl font-semibold text-gray-800">
            {statusCount(appointmentStats, "completed")}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 text-sm">
          <div className="text-gray-500">Cancelled</div>
          <div className="text-xl font-semibold text-gray-800">
            {statusCount(appointmentStats, "cancelled")}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Timeline</h2>
        {history.length ? (
          history.map((entry) => (
            <div key={entry._id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="font-semibold text-gray-800">
                  {new Date(entry.appointmentDate).toLocaleString()}
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  {entry.status}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {entry.doctorName} · {entry.department} · {entry.type}
              </div>

              {entry.prescription?._id ? (
                <div className="mt-3 rounded-md border border-gray-100 bg-gray-50 p-3 text-sm">
                  <div className="font-semibold text-gray-700">
                    Diagnosis: {entry.prescription.diagnosis}
                  </div>
                  <table className="mt-2 w-full border-collapse text-xs">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-1">Medicine</th>
                        <th className="py-1">Dosage</th>
                        <th className="py-1">Frequency</th>
                        <th className="py-1">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.prescription.medicines?.map((medicine, index) => (
                        <tr key={index} className="text-gray-600">
                          <td className="py-1">{medicine.name}</td>
                          <td className="py-1">{medicine.dosage}</td>
                          <td className="py-1">{medicine.frequency}</td>
                          <td className="py-1">{medicine.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-3 text-xs text-gray-400">No prescription</div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No appointments recorded.</p>
        )}
      </div>
    </section>
  );
};

export default PatientHistory;
