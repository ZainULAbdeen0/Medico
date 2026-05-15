import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hospital API",
      version: "1.0.0",
      description: "REST API for the Mediko hospital management system."
    },
    servers: [
      { url: "/", description: "Same origin (current host)" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Something went wrong" }
          }
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "65f0b8a4c2e9f1a3b4d5e6f7" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["admin", "doctor", "receptionist", "patient"] },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        PatientContacts: {
          type: "object",
          required: ["phone"],
          properties: {
            phone: { type: "string", minLength: 7 },
            emergency: { type: "string", minLength: 7 },
            address: { type: "string", minLength: 3 }
          }
        },
        Patient: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            dob: { type: "string", format: "date" },
            gender: { type: "string", enum: ["male", "female", "other"] },
            bloodGroup: { type: "string", enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
            allergies: { type: "array", items: { type: "string" } },
            contacts: { $ref: "#/components/schemas/PatientContacts" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Doctor: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            specialization: { type: "string" },
            department: { type: "string" },
            qualifications: { type: "array", items: { type: "string" } },
            bio: { type: "string" }
          }
        },
        Schedule: {
          type: "object",
          properties: {
            _id: { type: "string" },
            doctorId: { type: "string" },
            day: { type: "string", enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
            startTime: { type: "string", example: "09:00" },
            endTime: { type: "string", example: "17:00" },
            isActive: { type: "boolean" }
          }
        },
        Appointment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            patientId: { type: "string" },
            doctorId: { type: "string" },
            appointmentDate: { type: "string", format: "date-time" },
            type: { type: "string", enum: ["general", "follow-up", "emergency"] },
            status: { type: "string", enum: ["pending", "confirmed", "completed", "cancelled"] },
            notes: { type: "string" }
          }
        },
        Medicine: {
          type: "object",
          required: ["name", "dosage", "frequency", "duration"],
          properties: {
            name: { type: "string" },
            dosage: { type: "string", example: "500mg" },
            frequency: { type: "string", example: "twice daily" },
            duration: { type: "string", example: "7 days" }
          }
        },
        Prescription: {
          type: "object",
          properties: {
            _id: { type: "string" },
            appointmentId: { type: "string" },
            patientId: { type: "string" },
            doctorId: { type: "string" },
            medicines: { type: "array", items: { $ref: "#/components/schemas/Medicine" } },
            diagnosis: { type: "string" },
            notes: { type: "string" },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        AuditLog: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            action: { type: "string" },
            resource: { type: "string" },
            resourceId: { type: "string" },
            details: { type: "object", additionalProperties: true },
            createdAt: { type: "string", format: "date-time" }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: "Missing or invalid JWT",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
        },
        Forbidden: {
          description: "User role not permitted to access this resource",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
        },
        NotFound: {
          description: "Resource not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
        },
        ValidationError: {
          description: "Request payload failed validation",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
        }
      }
    },
    tags: [
      { name: "Auth", description: "Authentication and current user" },
      { name: "Patients", description: "Patient records" },
      { name: "Doctors", description: "Doctor profiles" },
      { name: "Schedules", description: "Doctor weekly availability" },
      { name: "Appointments", description: "Booked appointments" },
      { name: "Prescriptions", description: "E-prescriptions" },
      { name: "Analytics", description: "Admin dashboard data" },
      { name: "Audit", description: "Audit log" }
    ]
  },
  // Scan route files for @openapi JSDoc blocks. Works in dev (ts-node, src/)
  // and prod (compiled, dist/). tsc keeps comments by default so .js files
  // still carry the annotations after build.
  apis: [
    path.join(__dirname, "..", "routes", "*.ts"),
    path.join(__dirname, "..", "routes", "*.js")
  ]
};

export const openApiSpec = swaggerJsdoc(options);
