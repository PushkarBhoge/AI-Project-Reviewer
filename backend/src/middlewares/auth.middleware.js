import jwt from "jsonwebtoken";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { env } from "../config/env.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../config/logger.js";

const clerkClient = (env.CLERK_SECRET_KEY && !env.CLERK_SECRET_KEY.includes("sample")) 
  ? createClerkClient({ secretKey: env.CLERK_SECRET_KEY, publishableKey: env.CLERK_PUBLISHABLE_KEY }) 
  : null;

/**
 * Authentication Middleware (Clerk & Legacy JWT)
 * - Verifies Clerk JWT tokens using Clerk Backend API
 * - Auto-syncs/upserts user in MongoDB with default 3 tokens
 * - Attaches user document to req.user
 */
export const authenticate = async (req, _res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      throw new ApiError(401, "Access denied. No authentication token provided.");
    }

    let authenticatedUser = null;

    // 1. Try Clerk Token Verification if Clerk secret is configured
    if (env.CLERK_SECRET_KEY && !env.CLERK_SECRET_KEY.includes("sample")) {
      try {
        const payload = await verifyToken(token, {
          secretKey: env.CLERK_SECRET_KEY,
        });

        if (payload && payload.sub) {
          const clerkUserId = payload.sub;
          
          authenticatedUser = await User.findOne({ clerkId: clerkUserId });

          if (!authenticatedUser) {
            let name = "Developer";
            let email = `${clerkUserId}@clerk.user`;
            let avatar = "";

            if (clerkClient) {
              try {
                const clerkUser = await clerkClient.users.getUser(clerkUserId);
                name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Developer";
                email = clerkUser.emailAddresses?.[0]?.emailAddress || email;
                avatar = clerkUser.imageUrl || "";
              } catch (err) {
                logger.warn(`Could not fetch Clerk user metadata: ${err.message}`);
              }
            }

            authenticatedUser = await User.findOneAndUpdate(
              { email },
              {
                $setOnInsert: {
                  clerkId: clerkUserId,
                  name,
                  email,
                  avatar,
                  tokens: 3,
                  role: "user"
                }
              },
              { new: true, upsert: true }
            );
          }
        }
      } catch (clerkErr) {
        logger.debug(`Clerk token verification failed: ${clerkErr.message}`);
      }
    }

    // 2. Fallback to Legacy JWT token verification
    if (!authenticatedUser) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        authenticatedUser = await User.findById(decoded.id);
      } catch (legacyErr) {
        // Ignored
      }
    }

    if (!authenticatedUser) {
      throw new ApiError(401, "Authentication failed or token invalid/expired.");
    }

    req.user = authenticatedUser;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(401, "Authentication failed. Please sign in."));
  }
};

