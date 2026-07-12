import { body, param, query } from "express-validator";

const notes = body("notes").optional().trim().notEmpty().withMessage("Notes/Description cannot be empty.");
const description = body("description").optional().trim().notEmpty().withMessage("Description cannot be empty.");
const cost = body("cost").isFloat({ min: 0 }).withMessage("Maintenance cost cannot be negative.").toFloat();
const vehicleId = body("vehicleId").trim().notEmpty().withMessage("Vehicle ID is required.");
const date = body("date").optional().trim().isISO8601().withMessage("Invalid date format.");

export const maintenanceIdValidator = [
  param("maintenanceId").trim().notEmpty().withMessage("Maintenance log ID is required.")
];

export const createMaintenanceValidator = [
  notes,
  description,
  cost,
  vehicleId,
  date,
  body().custom((value) => value.notes || value.description).withMessage("A description or notes is required.")
];

export const listMaintenanceValidator = [
  query("status").optional().isIn(["Open", "Completed"]).withMessage("Invalid status parameter."),
  query("vehicleId").optional().trim().notEmpty().withMessage("Invalid vehicle filter.")
];
