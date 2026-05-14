import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAppointment, updateAppointmentStatus } from "../../services/appointmentService";
import { useAuth } from "../../context/AuthContext";

const AppointmentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAppointment = async () => {
    const response = await getAppointment(id);
    setAppointment(response.data.appointment);
  };

  useEffect(() => {
    fetchAppointment().catch((err) => {
      setError(err?.response?.data?.message || "Failed to load appointment");
    });
  }, [id]);

  const handleStatus = async (status) => {
    setIsUpdating(true);
    setError("");
    try {
      await updateAppointmentStatus(id, status);
      await fetchAppointment();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!appointment) {
    return <p className="text-sm text-gray-500">Loading appointment...</p>;
  }

  const canConfirm = user?.role === "doctor" && appointment.status === "pending";
  const canComplete = user?.role === "doctor" && appointment.status === "confirmed";
  const canCancel =
    (user?.role === "admin" || user?.role === "receptionist") &&
    (appointment.status === "pending" || appointment.status === "confirmed");

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Appointment Detail</h1>
          <p className="text-sm text-gray-600">Appointment #{appointment._id}</p>
        </div>
        <Link to="/appointments" className="text-sm font-semibold text-blue-600">
          Back to list
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700">Patient</h2>
          <p className="mt-2 text-sm text-gray-600">{appointment.patientId?.name}</p>
          <p className="text-xs text-gray-500">Blood Group: {appointment.patientId?.bloodGroup}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700">Doctor</h2>
          <p className="mt-2 text-sm text-gray-600">{appointment.doctorId?.userId?.name}</p>
          <p className="text-xs text-gray-500">{appointment.doctorId?.specialization}</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
        <div>Date: {new Date(appointment.appointmentDate).toLocaleString()}</div>
        <div>Type: {appointment.type}</div>
        <div>Status: {appointment.status}</div>
        <div>Notes: {appointment.notes || "-"}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {canConfirm ? (
          <button
            type="button"
            onClick={() => handleStatus("confirmed")}
            disabled={isUpdating}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Confirm
          </button>
        ) : null}
        {canComplete ? (
          <button
            type="button"
            onClick={() => handleStatus("completed")}
            disabled={isUpdating}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Complete
          </button>
        ) : null}
        {canCancel ? (
          <button
            type="button"
            onClick={() => handleStatus("cancelled")}
            disabled={isUpdating}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
        Prescription link coming in Sprint 06.
      </div>
    </section>
  );
};

export default AppointmentDetail;