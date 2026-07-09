import { Router } from "express";
import { createCheckoutSession } from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create-checkout-session", authenticate, createCheckoutSession);

export default router;
