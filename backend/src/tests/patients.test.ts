import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/User";
import Patient from "../models/Patient";

const testDbUri = "mongodb://127.0.0.1:27017/hospital_patients_test";

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

  return loginResponse.body.token as string;
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret";
  process.env.JWT_EXPIRES_IN = "7d";
  await mongoose.connect(testDbUri);
  await Patient.syncIndexes();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await Patient.deleteMany({});
  await User.deleteMany({});
});

describe("POST /api/patients", () => {
  test("receptionist can create patient → 201", async () => {
    const token = await buildToken("receptionist");

    const response = await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Jane Doe",
        dob: "1990-01-01",
        gender: "female",
        bloodGroup: "O+",
        allergies: ["pollen"],
        contacts: { phone: "1234567890", emergency: "0987654321" }
      });

    expect(response.status).toBe(201);
  });

  test("doctor cannot create patient → 403", async () => {
    const token = await buildToken("doctor");

    const response = await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Jane Doe",
        dob: "1990-01-01",
        gender: "female",
        bloodGroup: "O+",
        contacts: { phone: "1234567890" }
      });

    expect(response.status).toBe(403);
  });

  test("returns 400 on missing required fields", async () => {
    const token = await buildToken("receptionist");

    const response = await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Missing Fields" });

    expect(response.status).toBe(400);
  });
});

describe("GET /api/patients", () => {
  test("returns paginated list", async () => {
    const token = await buildToken("admin");

    await Patient.create({
      name: "Patient One",
      dob: new Date("1992-01-01"),
      gender: "male",
      bloodGroup: "A+",
      contacts: { phone: "1111111111" },
      registeredBy: new mongoose.Types.ObjectId()
    });

    const response = await request(app)
      .get("/api/patients?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.patients.length).toBeGreaterThan(0);
  });

  test("search by name works", async () => {
    const token = await buildToken("admin");

    await Patient.create({
      name: "Search Target",
      dob: new Date("1992-01-01"),
      gender: "male",
      bloodGroup: "A+",
      contacts: { phone: "1111111111" },
      registeredBy: new mongoose.Types.ObjectId()
    });

    const response = await request(app)
      .get("/api/patients?search=Target")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBeGreaterThan(0);
  });
});

describe("PUT /api/patients/:id", () => {
  test("updates and returns new doc", async () => {
    const token = await buildToken("receptionist");
    const patient = await Patient.create({
      name: "Old Name",
      dob: new Date("1992-01-01"),
      gender: "male",
      bloodGroup: "A+",
      contacts: { phone: "1111111111" },
      registeredBy: new mongoose.Types.ObjectId()
    });

    const response = await request(app)
      .put(`/api/patients/${patient._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name" });

    expect(response.status).toBe(200);
    expect(response.body.patient.name).toBe("New Name");
  });

  test("returns 404 on invalid id", async () => {
    const token = await buildToken("receptionist");
    const response = await request(app)
      .put("/api/patients/64b64c35f1e8b5b74e5b5f5f")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name" });

    expect(response.status).toBe(404);
  });
});