import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPatient } from "../../services/patientService";

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await getPatient(id);
        setPatient(response.data.patient);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load patient");
      }
    };

    fetchPatient();
  }, [id]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!patient) {
    return <p className="text-sm text-gray-500">Loading patient...</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{patient.name}</h1>
          <p className="text-sm text-gray-600">Patient profile</p>
        </div>
        <Link to="/patients" className="text-sm font-semibold text-blue-600">
          Back to list
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700">Basic Info</h2>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <div>Date of Birth: {new Date(patient.dob).toLocaleDateString()}</div>
            <div>Gender: {patient.gender}</div>
            <div>Blood Group: {patient.bloodGroup}</div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700">Contacts</h2>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <div>Phone: {patient.contacts?.phone}</div>
            <div>Emergency: {patient.contacts?.emergency || "-"}</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700">Allergies</h2>
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

      <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
        Appointment history coming soon.
      </div>
    </section>
  );
};

export default PatientDetail;