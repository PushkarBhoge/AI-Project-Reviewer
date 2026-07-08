import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * JWT Authentication Middleware
 * - Extracts Bearer token from Authorization header
 * - Verifies token signature and expiration
 * - Attaches decoded user document to req.user
 * - Returns 401 for missing/invalid/expired tokens
 */
export const authenticate = async (req, _res, next) => {
  try {
    // 1. Extract token from header or query param
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      throw new ApiError(401, "Access denied. No token provided.");
    }

    // 2. Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 3. Find user and attach to request
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, "Token is valid but user no longer exists.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token."));
    }
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token has expired. Please log in again."));
    }
    next(new ApiError(401, "Authentication failed."));
  }
};
