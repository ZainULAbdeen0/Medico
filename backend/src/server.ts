import dotenv from "dotenv";
import { apiReference } from "@scalar/express-api-reference";
import app from "./app";
import { connectDatabase } from "./config/db";
import { validateEnv } from "./config/env";

dotenv.config();

const env = validateEnv();

const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Hospital API",
    version: "1.0.0"
  },
  paths: {
    "/": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "OK"
          }
        }
      }
    }
  }
};

app.get("/docs", apiReference({ spec: openApiSpec }));

const startServer = async (): Promise<void> => {
  await connectDatabase(env.MONGODB_URI);
  const port: string | number = /^\d+$/.test(env.PORT) ? Number(env.PORT) : env.PORT;
  app.listen(port as never, () => {
    console.log(`Server listening on ${port}`);
  });
};

startServer().catch((error: Error) => {
  console.error("Failed to start server");
  console.error(error);
  process.exit(1);
});