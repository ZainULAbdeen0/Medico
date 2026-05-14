import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/User";
import Doctor from "../models/Doctor";
import Patient from "../models/Patient";
import Appointment from "../models/Appointment";

const testDbUri = "mongodb://127.0.0.1:27017/hospital_appointments_test";

const uniqueEmail = (role: string) => `${role}-${Date.now()}-${Math.random()}@example.com`;

const buildToken = async (role: "admin" | "doctor" | "receptionist") => {
  const user = await User.create({
    name: `${role} user`,
    email: uniqueEmail(role),
    password: "password123",
    role
  });

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: user.email,
    password: "password123"
  });

  return { token: loginResponse.body.token as string, user };
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret";
  process.env.JWT_EXPIRES_IN = "7d";
  await mongoose.connect(testDbUri);
  await Appointment.syncIndexes();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await Appointment.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});
  await User.deleteMany({});
});

const buildDoctorProfile = async () => {
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

describe("POST /api/appointments", () => {
  test("creates appointment → 201", async () => {
    const { token } = await buildToken("receptionist");
    const patient = await buildPatient();
    const { doctor } = await buildDoctorProfile();

    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        patientId: patient._id,
        doctorId: doctor._id,
        appointmentDate: new Date("2030-01-01T10:00:00Z"),
        type: "general"
      });

    expect(response.status).toBe(201);
  });

  test("returns 409 when doctor has conflict in 30min window", async () => {
    const { token } = await buildToken("receptionist");
    const patient = await buildPatient();
    const { doctor } = await buildDoctorProfile();

    await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: new Date("2030-01-01T10:00:00Z"),
      type: "general",
      status: "pending",
      createdBy: new mongoose.Types.ObjectId()
    });

    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        patientId: patient._id,
        doctorId: doctor._id,
        appointmentDate: new Date("2030-01-01T10:15:00Z"),
        type: "general"
      });

    expect(response.status).toBe(409);
  });

  test("returns 404 when patient does not exist", async () => {
    const { token } = await buildToken("receptionist");
    const { doctor } = await buildDoctorProfile();

    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        patientId: new mongoose.Types.ObjectId(),
        doctorId: doctor._id,
        appointmentDate: new Date("2030-01-01T10:00:00Z"),
        type: "general"
      });

    expect(response.status).toBe(404);
  });

  test("doctor role gets 403", async () => {
    const { token } = await buildToken("doctor");
    const patient = await buildPatient();
    const { doctor } = await buildDoctorProfile();

    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        patientId: patient._id,
        doctorId: doctor._id,
        appointmentDate: new Date("2030-01-01T10:00:00Z"),
        type: "general"
      });

    expect(response.status).toBe(403);
  });
});

describe("PATCH /api/appointments/:id/status", () => {
  test("doctor can confirm pending appointment", async () => {
    const { doctorUser, doctor } = await buildDoctorProfile();
    const doctorLogin = await request(app).post("/api/auth/login").send({
      email: doctorUser.email,
      password: "password123"
    });
    const doctorToken = doctorLogin.body.token;
    const patient = await buildPatient();

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: new Date("2030-01-01T10:00:00Z"),
      type: "general",
      status: "pending",
      createdBy: new mongoose.Types.ObjectId()
    });

    const response = await request(app)
      .patch(`/api/appointments/${appointment._id}/status`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ status: "confirmed" });

    expect(response.status).toBe(200);
    expect(response.body.appointment.status).toBe("confirmed");
  });

  test("receptionist can cancel confirmed appointment", async () => {
    const { token } = await buildToken("receptionist");
    const { doctor } = await buildDoctorProfile();
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
      .patch(`/api/appointments/${appointment._id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "cancelled" });

    expect(response.status).toBe(200);
    expect(response.body.appointment.status).toBe("cancelled");
  });

  test("invalid status transition returns 400", async () => {
    const { doctorUser, doctor } = await buildDoctorProfile();
    const doctorLogin = await request(app).post("/api/auth/login").send({
      email: doctorUser.email,
      password: "password123"
    });
    const doctorToken = doctorLogin.body.token;
    const patient = await buildPatient();

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: new Date("2030-01-01T10:00:00Z"),
      type: "general",
      status: "pending",
      createdBy: new mongoose.Types.ObjectId()
    });

    const response = await request(app)
      .patch(`/api/appointments/${appointment._id}/status`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ status: "completed" });

    expect(response.status).toBe(400);
  });
});