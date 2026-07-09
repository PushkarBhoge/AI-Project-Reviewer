import Stripe from "stripe";
import User from "../models/user.model.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../config/logger.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// Default pricing mapping for INR
const TOKEN_PACKAGES = {
  "starter": { tokens: 5, price: 9900, name: "Starter (5 Audits)" }, // 99 INR
  "pro": { tokens: 20, price: 29900, name: "Pro (20 Audits)" }, // 299 INR
  "unlimited": { tokens: 100, price: 99900, name: "Unlimited (100 Audits)" }, // 999 INR
};

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { packageId } = req.body;
  const pkg = TOKEN_PACKAGES[packageId];

  if (!pkg) {
    throw new ApiError(400, "Invalid package selected");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: req.user.email,
    client_reference_id: req.user._id.toString(),
    metadata: {
      tokens: String(pkg.tokens),
    },
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: pkg.name,
            description: `Adds ${pkg.tokens} tokens to your account for AI code auditing.`,
          },
          unit_amount: pkg.price,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard?success=true`,
    cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/?canceled=true`,
  });

  return ApiResponse.success(res, 200, "Checkout session created", {
    url: session.url,
  });
});

export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder"
    );
  } catch (err) {
    logger.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const tokensToAdd = parseInt(session.metadata.tokens, 10);

    if (userId && tokensToAdd) {
      await User.findByIdAndUpdate(userId, {
        $inc: { tokens: tokensToAdd }
      });
      logger.info(`Added ${tokensToAdd} tokens to user ${userId}`);
    }
  }

  res.json({ received: true });
});
