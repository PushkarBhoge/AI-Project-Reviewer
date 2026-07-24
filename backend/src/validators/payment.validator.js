import { body } from "express-validator";

export const createOrderRules = [
  body("packageId")
    .notEmpty()
    .withMessage("Package ID is required")
    .isIn(["starter", "pro", "unlimited"])
    .withMessage("Invalid package selected"),
];

export const verifyPaymentRules = [
  body("razorpay_order_id")
    .notEmpty()
    .withMessage("Razorpay order ID is required"),
  body("razorpay_payment_id")
    .notEmpty()
    .withMessage("Razorpay payment ID is required"),
  body("razorpay_signature")
    .notEmpty()
    .withMessage("Razorpay signature is required"),
  body("packageId")
    .notEmpty()
    .withMessage("Package ID is required")
    .isIn(["starter", "pro", "unlimited"])
    .withMessage("Invalid package selected"),
];
