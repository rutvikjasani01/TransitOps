import { body, param, query } from "express-validator";

const source = body("source").trim().notEmpty().withMessage("Source location is required.");
const destination = body("destination").trim().notEmpty().withMessage("Destination location is required.");
const cargoWeight = body("cargoWeight").isFloat({ gt: 0 }).withMessage("Cargo weight must be greater than zero.").toFloat();
const plannedDistance = body("plannedDistance").isFloat({ gt: 0 }).withMessage("Planned distance must be greater than zero.").toFloat();
const vehicleId = body("vehicleId").trim().notEmpty().withMessage("Vehicle ID is required.");
const driverId = body("driverId").trim().notEmpty().withMessage("Driver ID is required.");

export const tripIdValidator = [
  param("tripId").trim().notEmpty().withMessage("Trip ID is required.")
];

export const createTripValidator = [
  source,
  destination,
  cargoWeight,
  plannedDistance,
  vehicleId,
  driverId
];

export const listTripsValidator = [
  query("status").optional().isIn(["Draft", "Dispatched", "Completed", "Cancelled"]).withMessage("Invalid trip status.")
];
