import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import systemRoutes from "./routes/system.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import driverRoutes from "./routes/driver.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import fuelRoutes from "./routes/fuel.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import maintenanceRoutes from "./routes/maintenance.routes.js";
import reportRoutes from "./routes/report.routes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Security: Helmet headers
app.use(helmet());

// Security: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5000, // Set to high limit for local development and active dashboard fetching
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use(limiter);

app.disable("x-powered-by");
app.use(cors({ origin: true, credentials: true, methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json({ limit: "1mb" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/drivers", driverRoutes);
app.use("/api/v1/trips", tripRoutes);
app.use("/api/v1/fuel-logs", fuelRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/maintenance", maintenanceRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1", systemRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
