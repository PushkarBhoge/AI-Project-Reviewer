import { Router } from "express";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createOrderRules, verifyPaymentRules } from "../validators/payment.validator.js";

const router = Router();

router.post("/create-order", authenticate, createOrderRules, validate, createRazorpayOrder);
router.post("/create-checkout-session", authenticate, createOrderRules, validate, createRazorpayOrder);
router.post("/verify-payment", authenticate, verifyPaymentRules, validate, verifyRazorpayPayment);

export default router;
