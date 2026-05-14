import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPrescription } from "../../services/prescriptionService";

const PrescriptionView = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPrescription(id)
      .then((response) => setPrescription(response.data.prescription))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load prescription"));
  }, [id]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!prescription) {
    return <p className="text-sm text-gray-500">Loading prescription...</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-semibold">Prescription</h1>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Print
        </button>
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 p-6">
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div>
            <div className="font-semibold text-gray-700">Patient</div>
            <div className="text-gray-600">{prescription.patientId?.name}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Doctor</div>
            <div className="text-gray-600">{prescription.doctorId?.userId?.name}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Date</div>
            <div className="text-gray-600">
              {new Date(prescription.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-700">Medicines</h2>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="py-2">Name</th>
                <th className="py-2">Dosage</th>
                <th className="py-2">Frequency</th>
                <th className="py-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines.map((medicine, index) => (
                <tr key={index} className="border-b border-gray-100 text-gray-600">
                  <td className="py-2">{medicine.name}</td>
                  <td className="py-2">{medicine.dosage}</td>
                  <td className="py-2">{medicine.frequency}</td>
                  <td className="py-2">{medicine.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-sm">
          <div className="font-semibold text-gray-700">Diagnosis</div>
          <p className="text-gray-600">{prescription.diagnosis}</p>
        </div>

        <div className="text-sm">
          <div className="font-semibold text-gray-700">Notes</div>
          <p className="text-gray-600">{prescription.notes || "-"}</p>
        </div>
      </div>
    </section>
  );
};

export default PrescriptionView;
