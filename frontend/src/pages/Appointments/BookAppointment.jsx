import { useEffect, useMemo, useState } from "react";
import { createAppointment } from "../../services/appointmentService";
import { getPatients } from "../../services/patientService";
import { getDoctors, getDoctorSchedule } from "../../services/doctorService";
import { useNavigate } from "react-router-dom";

const BookAppointment = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    type: "general",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOptions = async () => {
      const [patientRes, doctorRes] = await Promise.all([getPatients(), getDoctors()]);
      setPatients(patientRes.data.patients || []);
      setDoctors(doctorRes.data.doctors || []);
    };

    loadOptions().catch(() => null);
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!form.doctorId) return;
      const response = await getDoctorSchedule(form.doctorId);
      setSchedule(response.data.schedules || []);
    };

    fetchSchedule().catch(() => null);
  }, [form.doctorId]);

  const activeDays = useMemo(() => schedule.filter((item) => item.isActive), [schedule]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const appointmentDate = new Date(`${form.date}T${form.time}`);
      await createAppointment({
        patientId: form.patientId,
        doctorId: form.doctorId,
        appointmentDate,
        type: form.type,
        notes: form.notes || undefined
      });
      navigate("/appointments");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to book appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Book Appointment</h1>
        <p className="text-sm text-gray-600">Create a new appointment for a patient.</p>
      </div>
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Patient</label>
            <select
              value={form.patientId}
              onChange={handleChange("patientId")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            >
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} ({patient.contacts?.phone})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Doctor</label>
            <select
              value={form.doctorId}
              onChange={handleChange("doctorId")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            >
              <option value="">Select doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.userId?.name} ({doctor.department})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={handleChange("date")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              value={form.time}
              onChange={handleChange("time")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select
              value={form.type}
              onChange={handleChange("type")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="general">General</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <input
              value={form.notes}
              onChange={handleChange("notes")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
          <div className="font-semibold text-gray-700">Available schedule</div>
          {activeDays.length ? (
            <ul className="mt-2 space-y-1">
              {activeDays.map((day) => (
                <li key={day.day}>
                  {day.day}: {day.startTime} - {day.endTime}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2">Select a doctor to view schedule.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {isSubmitting ? "Booking..." : "Book Appointment"}
        </button>
      </form>
    </section>
  );
};

export default BookAppointment;