import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/User";
import Doctor from "../models/Doctor";
import Patient from "../models/Patient";
import Appointment from "../models/Appointment";

const testDbUri = "mongodb://127.0.0.1:27017/hospital_analytics_test";

const uniqueEmail = (role: string) => `${role}-${Date.now()}-${Math.random()}@example.com`;

const loginAs = async (role: "admin" | "receptionist") => {
  const user = await User.create({
    name: role,
    email: uniqueEmail(role),
    password: "password123",
    role
  });
  const response = await request(app).post("/api/auth/login").send({
    email: user.email,
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
  await Appointment.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});
  await User.deleteMany({});
});

describe("GET /api/analytics/dashboard", () => {
  test("admin gets dashboard data with all four fields", async () => {
    const token = await loginAs("admin");
    const patient = await Patient.create({
      name: "Patient",
      dob: new Date("1990-01-01"),
      gender: "male",
      bloodGroup: "A+",
      contacts: { phone: "123456789" },
      registeredBy: new mongoose.Types.ObjectId()
    });
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
    await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: new Date(`${new Date().getFullYear()}-06-15T10:00:00Z`),
      type: "general",
      status: "completed",
      createdBy: new mongoose.Types.ObjectId()
    });

    const response = await request(app)
      .get("/api/analytics/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.summary).toBeDefined();
    expect(response.body.appointmentsByMonth).toBeDefined();
    expect(response.body.statusBreakdown).toBeDefined();
    expect(response.body.busiestDoctors).toBeDefined();
    expect(response.body.busiestDoctors[0].doctorName).toBe("Doctor");
  });

  test("non-admin gets 403", async () => {
    const token = await loginAs("receptionist");

    const response = await request(app)
      .get("/api/analytics/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});

describe("GET /api/analytics/trend", () => {
  test("monthly trend returns 12 months of data (0 for empty months)", async () => {
    const token = await loginAs("admin");

    const response = await request(app)
      .get("/api/analytics/trend")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.trend).toHaveLength(12);
    expect(response.body.trend.every((item: { count: number }) => item.count === 0)).toBe(true);
  });
});
