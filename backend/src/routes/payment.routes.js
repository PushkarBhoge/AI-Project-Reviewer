import { Router } from "express";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create-order", authenticate, createRazorpayOrder);
router.post("/create-checkout-session", authenticate, createRazorpayOrder);
router.post("/verify-payment", authenticate, verifyRazorpayPayment);

export default router;
