import { Router } from "express";
import { register, login, getProfile } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { registerRules, loginRules } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.get("/me", authenticate, getProfile);

export default router;
