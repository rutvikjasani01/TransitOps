import { Router } from "express";
import * as controller from "../controllers/maintenance.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createMaintenanceValidator,
  listMaintenanceValidator,
  maintenanceIdValidator
} from "../validators/maintenance.validator.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  listMaintenanceValidator,
  validateRequest,
  controller.list
);

router.get(
  "/:maintenanceId",
  maintenanceIdValidator,
  validateRequest,
  controller.getById
);

router.post(
  "/",
  authorize(ROLES.FLEET_MANAGER, ROLES.DRIVER),
  createMaintenanceValidator,
  validateRequest,
  controller.create
);

router.post(
  "/:maintenanceId/resolve",
  authorize(ROLES.FLEET_MANAGER),
  maintenanceIdValidator,
  validateRequest,
  controller.resolve
);

router.delete(
  "/:maintenanceId",
  authorize(ROLES.FLEET_MANAGER),
  maintenanceIdValidator,
  validateRequest,
  controller.remove
);

export default router;
