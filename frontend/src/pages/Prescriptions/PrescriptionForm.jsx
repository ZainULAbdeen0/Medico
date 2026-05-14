import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getAppointment } from "../../services/appointmentService";
import { createPrescription } from "../../services/prescriptionService";

const emptyMedicine = { name: "", dosage: "", frequency: "", duration: "" };

const PrescriptionForm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [medicines, setMedicines] = useState([{ ...emptyMedicine }]);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAppointment(appointmentId)
      .then((response) => setAppointment(response.data.appointment))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load appointment"));
  }, [appointmentId]);

  const handleMedicineChange = (index, field) => (event) => {
    const value = event.target.value;
    setMedicines((prev) =>
      prev.map((medicine, i) => (i === index ? { ...medicine, [field]: value } : medicine))
    );
  };

  const addMedicine = () => setMedicines((prev) => [...prev, { ...emptyMedicine }]);

  const removeMedicine = (index) =>
    setMedicines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await createPrescription({
        appointmentId,
        patientId: appointment.patientId?._id || appointment.patientId,
        medicines,
        diagnosis,
        notes: notes || undefined
      });
      navigate(`/appointments/${appointmentId}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create prescription");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !appointment) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!appointment) {
    return <p className="text-sm text-gray-500">Loading appointment...</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Write Prescription</h1>
          <p className="text-sm text-gray-600">
            Patient: {appointment.patientId?.name} · Appointment #{appointment._id}
          </p>
        </div>
        <Link to={`/appointments/${appointmentId}`} className="text-sm font-semibold text-blue-600">
          Back to appointment
        </Link>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Medicines</h2>
            <button
              type="button"
              onClick={addMedicine}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700"
            >
              Add medicine
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {medicines.map((medicine, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-5">
                <input
                  value={medicine.name}
                  onChange={handleMedicineChange(index, "name")}
                  placeholder="Name"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  required
                />
                <input
                  value={medicine.dosage}
                  onChange={handleMedicineChange(index, "dosage")}
                  placeholder="Dosage (500mg)"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  required
                />
                <input
                  value={medicine.frequency}
                  onChange={handleMedicineChange(index, "frequency")}
                  placeholder="Frequency (2x daily)"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  required
                />
                <input
                  value={medicine.duration}
                  onChange={handleMedicineChange(index, "duration")}
                  placeholder="Duration (7 days)"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeMedicine(index)}
                  disabled={medicines.length === 1}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Diagnosis</label>
          <textarea
            value={diagnosis}
            onChange={(event) => setDiagnosis(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            rows={2}
            placeholder="Optional"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : "Save Prescription"}
        </button>
      </form>
    </section>
  );
};

export default PrescriptionForm;
