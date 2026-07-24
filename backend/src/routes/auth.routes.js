import { Router } from "express";
import { getProfile } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", authenticate, getProfile);

export default router;

