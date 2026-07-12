import { Router } from "express";
import * as controller from "../controllers/report.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(authenticate);

router.get(
  "/fleet",
  authorize(ROLES.FLEET_MANAGER, ROLES.DRIVER, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST),
  controller.getFleet
);

router.get(
  "/finance",
  authorize(ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  controller.getFinance
);

router.get(
  "/safety",
  authorize(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER),
  controller.getSafety
);

export default router;
