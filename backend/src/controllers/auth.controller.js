import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  // Create new user (password hashing handled by pre-save hook)
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate JWT token
  const token = user.generateAuthToken();

  // Remove password from response object
  const userObj = user.toObject();
  delete userObj.password;

  return ApiResponse.success(res, 201, "User registered successfully", {
    user: userObj,
    token,
  });
});

/**
 * @desc    Login user & return JWT
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and explicitly select password
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate token
  const token = user.generateAuthToken();

  const userObj = user.toObject();
  delete userObj.password;

  return ApiResponse.success(res, 200, "Login successful", {
    user: userObj,
    token,
  });
});

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  // req.user is attached by the authenticate middleware
  return ApiResponse.success(res, 200, "User profile retrieved successfully", {
    user: req.user,
  });
});
