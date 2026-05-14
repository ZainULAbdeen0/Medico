import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/User";
import Doctor from "../models/Doctor";

const testDbUri = "mongodb://127.0.0.1:27017/hospital_doctors_test";

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
  await Doctor.syncIndexes();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await Doctor.deleteMany({});
  await User.deleteMany({});
});

describe("POST /api/doctors", () => {
  test("admin creates doctor profile → 201", async () => {
    const { token, user } = await buildToken("admin");
    const doctorUser = await User.create({
      name: "Doctor User",
      email: uniqueEmail("doctor"),
      password: "password123",
      role: "doctor"
    });

    const response = await request(app)
      .post("/api/doctors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        userId: doctorUser._id,
        specialization: "Cardiology",
        department: "Cardiology",
        qualifications: ["MBBS"],
        bio: "Senior cardiologist"
      });

    expect(response.status).toBe(201);
    expect(response.body.doctor.userId).toBe(String(doctorUser._id));
  });

  test("returns 409 if doctor profile already exists for userId", async () => {
    const { token } = await buildToken("admin");
    const doctorUser = await User.create({
      name: "Doctor User",
      email: uniqueEmail("doctor"),
      password: "password123",
      role: "doctor"
    });

    await Doctor.create({
      userId: doctorUser._id,
      specialization: "Dermatology",
      department: "Dermatology",
      qualifications: []
    });

    const response = await request(app)
      .post("/api/doctors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        userId: doctorUser._id,
        specialization: "Dermatology",
        department: "Dermatology"
      });

    expect(response.status).toBe(409);
  });

  test("returns 400 if userId is not a doctor role user", async () => {
    const { token } = await buildToken("admin");
    const nonDoctorUser = await User.create({
      name: "Receptionist",
      email: uniqueEmail("receptionist"),
      password: "password123",
      role: "receptionist"
    });

    const response = await request(app)
      .post("/api/doctors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        userId: nonDoctorUser._id,
        specialization: "Cardiology",
        department: "Cardiology"
      });

    expect(response.status).toBe(400);
  });

  test("non-admin gets 403", async () => {
    const { token } = await buildToken("doctor");
    const response = await request(app)
      .post("/api/doctors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        userId: new mongoose.Types.ObjectId(),
        specialization: "Cardiology",
        department: "Cardiology"
      });

    expect(response.status).toBe(403);
  });
});

describe("POST /api/schedules", () => {
  test("creates schedule for valid doctorId and day", async () => {
    const { token } = await buildToken("admin");
    const doctorUser = await User.create({
      name: "Doctor User",
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

    const response = await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        doctorId: doctor._id,
        day: "Monday",
        startTime: "09:00",
        endTime: "17:00",
        isActive: true
      });

    expect(response.status).toBe(200);
    expect(response.body.schedule.day).toBe("Monday");
  });

  test("upserts if schedule already exists for that day", async () => {
    const { token } = await buildToken("admin");
    const doctorUser = await User.create({
      name: "Doctor User",
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

    await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        doctorId: doctor._id,
        day: "Monday",
        startTime: "09:00",
        endTime: "17:00",
        isActive: true
      });

    const response = await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        doctorId: doctor._id,
        day: "Monday",
        startTime: "10:00",
        endTime: "18:00",
        isActive: false
      });

    expect(response.status).toBe(200);
    expect(response.body.schedule.startTime).toBe("10:00");
  });
});