import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/User";
import Patient from "../models/Patient";
import AuditLog from "../models/AuditLog";
import { AUDIT_ACTIONS } from "../utils/auditActions";

const testDbUri = "mongodb://127.0.0.1:27017/hospital_audit_test";

const uniqueEmail = (role: string) => `${role}-${Date.now()}-${Math.random()}@example.com`;

// Audit logging is fire-and-forget, so the document may land just after the
// HTTP response. Poll briefly instead of asserting immediately.
const waitForLog = async (filter: Record<string, unknown>, attempts = 10) => {
  for (let i = 0; i < attempts; i += 1) {
    const found = await AuditLog.findOne(filter);
    if (found) {
      return found;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return null;
};

const createUser = async (role: "admin" | "receptionist") => {
  const user = await User.create({
    name: role,
    email: uniqueEmail(role),
    password: "password123",
    role
  });
  return user;
};

const loginAs = async (email: string) => {
  const response = await request(app).post("/api/auth/login").send({
    email,
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
  await AuditLog.deleteMany({});
  await Patient.deleteMany({});
  await User.deleteMany({});
});

describe("Audit Logging", () => {
  test("login creates audit log entry", async () => {
    const user = await createUser("admin");
    await loginAs(user.email);

    const logEntry = await waitForLog({ action: AUDIT_ACTIONS.USER_LOGIN });
    expect(logEntry).not.toBeNull();
    expect(String(logEntry?.userId)).toBe(String(user._id));
  });

  test("creating patient creates audit log entry", async () => {
    const user = await createUser("receptionist");
    const token = await loginAs(user.email);

    await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Patient",
        dob: "1990-01-01",
        gender: "male",
        bloodGroup: "A+",
        contacts: { phone: "123456789" }
      });

    const logEntry = await waitForLog({ action: AUDIT_ACTIONS.CREATE_PATIENT });
    expect(logEntry).not.toBeNull();
    expect(logEntry?.resource).toBe("patients");
  });
});

describe("GET /api/audit-logs", () => {
  test("admin can view logs", async () => {
    const admin = await createUser("admin");
    const token = await loginAs(admin.email);
    await waitForLog({ action: AUDIT_ACTIONS.USER_LOGIN });

    const response = await request(app)
      .get("/api/audit-logs")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.logs)).toBe(true);
    expect(response.body.logs.length).toBeGreaterThan(0);
  });

  test("non-admin gets 403", async () => {
    const receptionist = await createUser("receptionist");
    const token = await loginAs(receptionist.email);

    const response = await request(app)
      .get("/api/audit-logs")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test("filter by action works", async () => {
    const admin = await createUser("admin");
    const token = await loginAs(admin.email);
    await AuditLog.create({
      userId: admin._id,
      action: AUDIT_ACTIONS.DELETE_PATIENT,
      resource: "patients"
    });

    const response = await request(app)
      .get("/api/audit-logs")
      .query({ action: AUDIT_ACTIONS.DELETE_PATIENT })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.logs).toHaveLength(1);
    expect(response.body.logs[0].action).toBe(AUDIT_ACTIONS.DELETE_PATIENT);
  });
});

describe("Rate Limiting", () => {
  test("returns 429 after repeated failed login attempts in window", async () => {
    process.env.RATE_LIMIT_DISABLED = "false";
    try {
      let lastStatus = 0;
      for (let i = 0; i < 15; i += 1) {
        const response = await request(app).post("/api/auth/login").send({
          email: "nobody@example.com",
          password: "wrongpassword"
        });
        lastStatus = response.status;
      }
      expect(lastStatus).toBe(429);
    } finally {
      process.env.RATE_LIMIT_DISABLED = "true";
    }
  });
});
