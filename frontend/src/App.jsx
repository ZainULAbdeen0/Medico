import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./routes/ProtectedRoute";
import PatientList from "./pages/Patients/PatientList";
import PatientDetail from "./pages/Patients/PatientDetail";
import PatientCreate from "./pages/Patients/PatientCreate";
import PatientEdit from "./pages/Patients/PatientEdit";
import PatientHistory from "./pages/Patients/PatientHistory";
import DoctorList from "./pages/Doctors/DoctorList";
import DoctorCreate from "./pages/Doctors/DoctorCreate";
import ScheduleManager from "./pages/Doctors/ScheduleManager";
import AppointmentList from "./pages/Appointments/AppointmentList";
import BookAppointment from "./pages/Appointments/BookAppointment";
import AppointmentDetail from "./pages/Appointments/AppointmentDetail";
import PrescriptionForm from "./pages/Prescriptions/PrescriptionForm";
import PrescriptionView from "./pages/Prescriptions/PrescriptionView";

const App = () => {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/patients" element={<PatientList />} />
                        <Route path="/patients/new" element={<PatientCreate />} />
                        <Route path="/patients/:id" element={<PatientDetail />} />
                        <Route path="/patients/:id/edit" element={<PatientEdit />} />
                        <Route path="/patients/:id/history" element={<PatientHistory />} />
                                                <Route path="/doctors" element={<DoctorList />} />
                                                <Route path="/appointments" element={<AppointmentList />} />
                                                <Route path="/appointments/:id" element={<AppointmentDetail />} />
                                                <Route path="/prescriptions/:id" element={<PrescriptionView />} />
                                                <Route element={<ProtectedRoute roles={["admin"]} />}>
                                                    <Route path="/doctors/new" element={<DoctorCreate />} />
                                                    <Route path="/doctors/:id/schedule" element={<ScheduleManager />} />
                                                </Route>
                                                <Route element={<ProtectedRoute roles={["admin", "receptionist"]} />}>
                                                    <Route path="/appointments/new" element={<BookAppointment />} />
                                                </Route>
                                                <Route element={<ProtectedRoute roles={["doctor"]} />}>
                                                    <Route path="/appointments/:appointmentId/prescribe" element={<PrescriptionForm />} />
                                                </Route>
                    </Route>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App;