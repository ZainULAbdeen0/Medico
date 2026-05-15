import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().min(1, "PORT is required"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN is required"),
  NODE_ENV: z.string().optional()
});

export type EnvVars = z.infer<typeof envSchema>;

export const validateEnv = (): EnvVars => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.errors.map((err) => err.message).join(", ");
    throw new Error(`Environment validation error: ${details}`);
  }
  return parsed.data;
};