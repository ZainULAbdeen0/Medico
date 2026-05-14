import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/User";
import Doctor from "../models/Doctor";
import Patient from "../models/Patient";
import Appointment from "../models/Appointment";
import Prescription from "../models/Prescription";

const testDbUri = "mongodb://127.0.0.1:27017/hospital_history_test";

const uniqueEmail = (role: string) => `${role}-${Date.now()}-${Math.random()}@example.com`;

const buildDoctor = async () => {
  const doctorUser = await User.create({
    name: "Dr House",
    email: uniqueEmail("doctor"),
    password: "password123",
    role: "doctor"
  });
  const doctor = await Doctor.create({
    userId: doctorUser._id,
    specialization: "Cardiology",
    department: "Cardiology",
    qualifications: []
  });
  return { doctorUser, doctor };
};

const buildPatient = async () =>
  Patient.create({
    name: "Patient",
    dob: new Date("1990-01-01"),
    gender: "male",
    bloodGroup: "A+",
    contacts: { phone: "123456789" },
    registeredBy: new mongoose.Types.ObjectId()
  });

const loginAdmin = async () => {
  const admin = await User.create({
    name: "Admin",
    email: uniqueEmail("admin"),
    password: "password123",
    role: "admin"
  });
  const response = await request(app).post("/api/auth/login").send({
    email: admin.email,
    password: "password123"
  });
  return response.body.token as string;
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret";
  process.env.JWT_EXPIRES_IN = "7d";
  await mongoose.connect(testDbUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await Prescription.deleteMany({});
  await Appointment.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});
  await User.deleteMany({});
});

describe("GET /api/patients/:id/history", () => {
  test("returns appointment history with embedded prescriptions", async () => {
    const token = await loginAdmin();
    const { doctor } = await buildDoctor();
    const patient = await buildPatient();
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: new Date("2030-01-02T10:00:00Z"),
      type: "general",
      status: "completed",
      createdBy: new mongoose.Types.ObjectId()
    });
    await Prescription.create({
      appointmentId: appointment._id,
      patientId: patient._id,
      doctorId: doctor._id,
      medicines: [{ name: "Med A", dosage: "500mg", frequency: "2x daily", duration: "7 days" }],
      diagnosis: "Flu"
    });

    const response = await request(app)
      .get(`/api/patients/${patient._id}/history`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.history).toHaveLength(1);
    expect(response.body.history[0].prescription.diagnosis).toBe("Flu");
    expect(response.body.history[0].doctorName).toBe("Dr House");
  });

  test("appointments without prescriptions still appear (preserveNullAndEmptyArrays)", async () => {
    const token = await loginAdmin();
    const { doctor } = await buildDoctor();
    const patient = await buildPatient();
    await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: new Date("2030-01-02T10:00:00Z"),
      type: "general",
      status: "pending",
      createdBy: new mongoose.Types.ObjectId()
    });

    const response = await request(app)
      .get(`/api/patients/${patient._id}/history`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.history).toHaveLength(1);
    expect(response.body.history[0].prescription._id).toBeUndefined();
  });

  test("returns 404 if patient does not exist", async () => {
    const token = await loginAdmin();

    const response = await request(app)
      .get(`/api/patients/${new mongoose.Types.ObjectId()}/history`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  test("history sorted by appointmentDate descending", async () => {
    const token = await loginAdmin();
    const { doctor } = await buildDoctor();
    const patient = await buildPatient();
    await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: new Date("2030-01-01T10:00:00Z"),
      type: "general",
      status: "completed",
      createdBy: new mongoose.Types.ObjectId()
    });
    await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: new Date("2030-03-01T10:00:00Z"),
      type: "general",
      status: "completed",
      createdBy: new mongoose.Types.ObjectId()
    });

    const response = await request(app)
      .get(`/api/patients/${patient._id}/history`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(new Date(response.body.history[0].appointmentDate).getTime()).toBeGreaterThan(
      new Date(response.body.history[1].appointmentDate).getTime()
    );
  });
});
