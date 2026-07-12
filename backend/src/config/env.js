import dotenv from "dotenv";

dotenv.config();

const required = ["JWT_SECRET"];
if (process.env.NODE_ENV === "production") {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "transitops-development-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h"
};
