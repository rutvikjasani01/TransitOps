import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";

const router = Router();
router.post("/login", loginValidator, validateRequest, controller.login);
router.post("/register", registerValidator, validateRequest, controller.register);
router.post("/logout", authenticate, controller.logout);
router.get("/me", authenticate, controller.me);
export default router;
