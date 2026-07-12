import { Router } from "express";
import { health, protectedExample } from "../controllers/system.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();
router.get("/health", health);
router.get("/protected", authenticate, protectedExample);
export default router;
