import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/User";
import Doctor from "../models/Doctor";
import Patient from "../models/Patient";
import Appointment from "../models/Appointment";
import Prescription from "../models/Prescription";

const testDbUri = "mongodb://127.0.0.1:27017/hospital_prescriptions_test";

const uniqueEmail = (role: string) => `${role}-${Date.now()}-${Math.random()}@example.com`;

const buildDoctor = async () => {
  const doctorUser = await User.create({
    name: "Doctor",
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

const buildPatient = async () => {
  return Patient.create({
    name: "Patient",
    dob: new Date("1990-01-01"),
    gender: "male",
    bloodGroup: "A+",
    contacts: { phone: "123456789" },
    registeredBy: new mongoose.Types.ObjectId()
  });
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret";
  process.env.JWT_EXPIRES_IN = "7d";
  await mongoose.connect(testDbUri);
  await Prescription.syncIndexes();
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

const loginDoctor = async (doctorUser: { email: string }) => {
  const loginResponse = await request(app).post("/api/auth/login").send({
    email: doctorUser.email,
    password: "password123"
  });
  return loginResponse.body.token as string;
};

describe("POST /api/prescriptions", () => {
  test("doctor creates prescription → 201", async () => {
    const { doctorUser, doctor } = await buildDoctor();
    const token = await loginDoctor(doctorUser);
    const patient = await buildPatient();
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: new Date("2030-01-01T10:00:00Z"),
      type: "general",
      status: "confirmed",
      createdBy: new mongoose.Types.ObjectId()
    });

    const response = await request(app)
      .post("/api/prescriptions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        appointmentId: appointment._id,
        patientId: patient._id,
        medicines: [
          { name: "Med A", dosage: "500mg", frequency: "2x daily", duration: "7 days" }
        ],
        diagnosis: "Flu",
        notes: "Rest"
      });

    expect(response.status).toBe(201);
    const updatedAppointment = await Appointment.findById(appointment._id);
    expect(updatedAppointment?.status).toBe("completed");
  });

  test("returns 409 if prescription already exists for appointment", async () => {
    const { doctorUser, doctor } = await buildDoctor();
    const token = await loginDoctor(doctorUser);
    const patient = await buildPatient();
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: new Date("2030-01-01T10:00:00Z"),
      type: "general",
      status: "confirmed",
      createdBy: new mongoose.Types.ObjectId()
    });

    await Prescription.create({
      appointmentId: appointment._id,
      patientId: patient._id,
      doctorId: doctor._id,
      medicines: [
        { name: "Med A", dosage: "500mg", frequency: "2x daily", duration: "7 days" }
      ],
      diagnosis: "Flu"
    });

    const response = await request(app)
      .post("/api/prescriptions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        appointmentId: appointment._id,
        patientId: patient._id,
        medicines: [
          { name: "Med B", dosage: "250mg", frequency: "1x daily", duration: "5 days" }
        ],
        diagnosis: "Flu"
      });

    expect(response.status).toBe(409);
  });

  test("returns 403 if doctor tries to prescribe for another doctor's appointment", async () => {
    const { doctorUser, doctor } = await buildDoctor();
    const token = await loginDoctor(doctorUser);
    const patient = await buildPatient();
    const otherDoctor = await Doctor.create({
      userId: new mongoose.Types.ObjectId(),
      specialization: "Cardiology",
      department: "Cardiology",
      qualifications: []
    });
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: otherDoctor._id,
      appointmentDate: new Date("2030-01-01T10:00:00Z"),
      type: "general",
      status: "confirmed",
      createdBy: new mongoose.Types.ObjectId()
    });

    const response = await request(app)
      .post("/api/prescriptions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        appointmentId: appointment._id,
        patientId: patient._id,
        medicines: [
          { name: "Med A", dosage: "500mg", frequency: "2x daily", duration: "7 days" }
        ],
        diagnosis: "Flu"
      });

    expect(response.status).toBe(403);
  });

  test("receptionist gets 403", async () => {
    const receptionist = await User.create({
      name: "Receptionist",
      email: uniqueEmail("receptionist"),
      password: "password123",
      role: "receptionist"
    });
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: receptionist.email,
      password: "password123"
    });

    const response = await request(app)
      .post("/api/prescriptions")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send({
        appointmentId: new mongoose.Types.ObjectId(),
        patientId: new mongoose.Types.ObjectId(),
        medicines: [
          { name: "Med A", dosage: "500mg", frequency: "2x daily", duration: "7 days" }
        ],
        diagnosis: "Flu"
      });

    expect(response.status).toBe(403);
  });
});

describe("GET /api/patients/:id/prescriptions", () => {
  test("returns all prescriptions for patient sorted by date", async () => {
    const admin = await User.create({
      name: "Admin",
      email: uniqueEmail("admin"),
      password: "password123",
      role: "admin"
    });
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: admin.email,
      password: "password123"
    });
    const token = loginResponse.body.token;
    const patient = await buildPatient();
    const { doctor } = await buildDoctor();

    await Prescription.create({
      appointmentId: new mongoose.Types.ObjectId(),
      patientId: patient._id,
      doctorId: doctor._id,
      medicines: [
        { name: "Med A", dosage: "500mg", frequency: "2x daily", duration: "7 days" }
      ],
      diagnosis: "Flu",
      createdAt: new Date("2030-01-02T10:00:00Z")
    });

    await Prescription.create({
      appointmentId: new mongoose.Types.ObjectId(),
      patientId: patient._id,
      doctorId: doctor._id,
      medicines: [
        { name: "Med B", dosage: "250mg", frequency: "1x daily", duration: "5 days" }
      ],
      diagnosis: "Cold",
      createdAt: new Date("2030-01-03T10:00:00Z")
    });

    const response = await request(app)
      .get(`/api/patients/${patient._id}/prescriptions`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.prescriptions[0].diagnosis).toBe("Cold");
  });
});