import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db";
import { validateEnv } from "./config/env";
import User from "./models/User";
import Doctor from "./models/Doctor";

dotenv.config();

// Accounts to seed. Doctor entries also get a `doctors` profile so the
// doctor-management screens aren't empty on first run.
const SEED_PASSWORD = "password123";

const users = [
  { name: "System Admin", email: "admin@hospital.com", role: "admin" as const },
  { name: "Front Desk", email: "reception@hospital.com", role: "receptionist" as const },
  {
    name: "Dr. Sarah Khan",
    email: "sarah@hospital.com",
    role: "doctor" as const,
    profile: { specialization: "Cardiologist", department: "Cardiology", qualifications: ["MBBS", "FCPS"] }
  },
  {
    name: "Dr. Imran Ali",
    email: "imran@hospital.com",
    role: "doctor" as const,
    profile: { specialization: "Pediatrician", department: "Pediatrics", qualifications: ["MBBS", "DCH"] }
  }
];

const seed = async (): Promise<void> => {
  const env = validateEnv();
  await connectDatabase(env.MONGODB_URI);

  for (const entry of users) {
    let user = await User.findOne({ email: entry.email });
    if (user) {
      console.log(`exists  ${entry.role.padEnd(12)} ${entry.email}`);
    } else {
      // .create() runs the pre-save hook → password is bcrypt-hashed.
      user = await User.create({
        name: entry.name,
        email: entry.email,
        password: SEED_PASSWORD,
        role: entry.role
      });
      console.log(`created ${entry.role.padEnd(12)} ${entry.email}`);
    }

    if (entry.profile) {
      const hasProfile = await Doctor.exists({ userId: user._id });
      if (!hasProfile) {
        await Doctor.create({ userId: user._id, ...entry.profile });
        console.log(`        + doctor profile (${entry.profile.department})`);
      }
    }
  }

  console.log(`\nDone. All seeded accounts use the password: ${SEED_PASSWORD}`);
  await mongoose.disconnect();
};

seed().catch((error: Error) => {
  console.error("Seed failed:");
  console.error(error);
  process.exit(1);
});
