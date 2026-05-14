import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/User";

const testDbUri = "mongodb://127.0.0.1:27017/hospital_auth_test";

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
  await User.deleteMany({});
});

describe("POST /api/auth/register", () => {
  test("creates user and returns 201", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin"
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.password).toBeUndefined();
  });

  test("returns 409 on duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin"
    });

    const response = await request(app).post("/api/auth/register").send({
      name: "Another User",
      email: "admin@example.com",
      password: "password123",
      role: "admin"
    });

    expect(response.status).toBe(409);
  });

  test("returns 400 on invalid body", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "not-an-email"
    });

    expect(response.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  test("returns token on valid credentials", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin"
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123"
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test("returns 401 on wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin"
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "wrongpassword"
    });

    expect(response.status).toBe(401);
  });

  test("returns 400 on missing fields", async () => {
    const response = await request(app).post("/api/auth/login").send({});

    expect(response.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  test("returns user when valid token provided", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin"
    });

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123"
    });

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
  });

  test("returns 401 when no token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
  });
});