import { Router } from "express";
import * as controller from "../controllers/trip.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createTripValidator,
  listTripsValidator,
  tripIdValidator
} from "../validators/trip.validator.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  listTripsValidator,
  validateRequest,
  controller.list
);

router.get(
  "/:tripId",
  tripIdValidator,
  validateRequest,
  controller.getById
);

router.post(
  "/",
  authorize(ROLES.FLEET_MANAGER, ROLES.DRIVER),
  createTripValidator,
  validateRequest,
  controller.create
);

router.post(
  "/:tripId/dispatch",
  authorize(ROLES.FLEET_MANAGER, ROLES.DRIVER),
  tripIdValidator,
  validateRequest,
  controller.dispatchTrip
);

router.post(
  "/:tripId/complete",
  authorize(ROLES.FLEET_MANAGER, ROLES.DRIVER),
  tripIdValidator,
  validateRequest,
  controller.completeTrip
);

router.post(
  "/:tripId/cancel",
  authorize(ROLES.FLEET_MANAGER, ROLES.DRIVER),
  tripIdValidator,
  validateRequest,
  controller.cancelTrip
);

export default router;
