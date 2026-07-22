import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/user.model.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../config/logger.js";

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || "razorpay_secret_placeholder",
  });
};

// Default pricing mapping for INR
const TOKEN_PACKAGES = {
  "starter": { tokens: 5, amount: 99, name: "Starter Pack (5 Audits)" }, // 99 INR
  "pro": { tokens: 20, amount: 299, name: "Pro Pack (20 Audits)" }, // 299 INR
  "unlimited": { tokens: 100, amount: 999, name: "Power Pack (100 Audits)" }, // 999 INR
};

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { packageId } = req.body;
  const pkg = TOKEN_PACKAGES[packageId];

  if (!pkg) {
    throw new ApiError(400, "Invalid package selected");
  }

  const options = {
    amount: pkg.amount * 100, // Amount in paise
    currency: "INR",
    receipt: `rcpt_${req.user._id.toString().slice(-10)}_${Date.now()}`,

    notes: {
      userId: req.user._id.toString(),
      packageId: packageId,
      tokens: String(pkg.tokens),
    },
  };

  let order;
  try {
    const razorpay = getRazorpayInstance();
    order = await razorpay.orders.create(options);
  } catch (err) {

    const errorDetails = err?.error?.description || err?.message || "Failed to create Razorpay order";
    logger.error(`Razorpay order creation failed: ${errorDetails}`);
    throw new ApiError(500, `Razorpay Payment Gateway Error: ${errorDetails}. Please check your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env`);
  }

  return ApiResponse.success(res, 200, "Razorpay order created successfully", {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",

    packageName: pkg.name,
    tokens: pkg.tokens,
    userEmail: req.user.email,
    userName: req.user.name,
  });
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !packageId) {
    throw new ApiError(400, "Missing required payment verification parameters");
  }

  const pkg = TOKEN_PACKAGES[packageId];
  if (!pkg) {
    throw new ApiError(400, "Invalid package selected");
  }

  const secret = env.RAZORPAY_KEY_SECRET || "razorpay_secret_placeholder";
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment verification failed: Invalid signature");
  }

  // Credit tokens to user account
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $inc: { tokens: pkg.tokens } },
    { new: true }
  );

  logger.info(`Added ${pkg.tokens} tokens to user ${req.user._id} via Razorpay order ${razorpay_order_id}`);

  return ApiResponse.success(res, 200, "Payment verified successfully", {
    tokens: updatedUser.tokens,
  });
});

export const razorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || "razorpay_webhook_secret_placeholder";
  const signature = req.headers["x-razorpay-signature"];

  if (!signature) {
    return res.status(400).send("Missing Razorpay signature header");
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (expectedSignature !== signature) {
    logger.error("Razorpay webhook signature verification failed");
    return res.status(400).send("Invalid webhook signature");
  }

  const event = req.body;

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload.payment.entity;
    const userId = payment.notes?.userId;
    const tokensToAdd = parseInt(payment.notes?.tokens, 10);

    if (userId && tokensToAdd) {
      await User.findByIdAndUpdate(userId, {
        $inc: { tokens: tokensToAdd },
      });
      logger.info(`Webhook: Added ${tokensToAdd} tokens to user ${userId}`);
    }
  }

  res.json({ status: "ok" });
});
