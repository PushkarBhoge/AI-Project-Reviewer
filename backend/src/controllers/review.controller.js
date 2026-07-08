import Review from "../models/review.model.js";
import Project from "../models/project.model.js";
import { runReviewPipeline } from "../services/review.pipeline.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../config/logger.js";

/**
 * @desc    Trigger AI review for a project (runs in background)
 * @route   POST /api/v1/reviews/:projectId
 * @access  Private
 */
export const createReview = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // 1. Verify project exists and belongs to current user
  const project = await Project.findOne({
    _id: projectId,
    user: req.user._id,
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // 2. Check if a review is already running
  if (project.status === "reviewing") {
    return ApiResponse.success(res, 200, "Review is already in progress for this repository", {
      status: "reviewing",
    });
  }

  // 3. Start review pipeline asynchronously in background
  runReviewPipeline(projectId, req.user._id).catch((err) => {
    logger.error(`Background Review Pipeline error for project ${projectId}: ${err.message}`);
  });

  // 4. Return success immediately (202 Accepted style)
  return ApiResponse.success(res, 202, "AI Review started in background", {
    status: "reviewing",
  });
});

/**
 * @desc    Get all reviews for a project
 * @route   GET /api/v1/reviews/project/:projectId
 * @access  Private
 */
export const getReviewsByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Verify project ownership
  const project = await Project.findOne({
    _id: projectId,
    user: req.user._id,
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const reviews = await Review.find({ project: projectId }).sort({ createdAt: -1 });

  return ApiResponse.success(res, 200, "Reviews retrieved successfully", {
    reviews,
  });
});

/**
 * @desc    Get single review by ID
 * @route   GET /api/v1/reviews/:id
 * @access  Private
 */
export const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("project");

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  return ApiResponse.success(res, 200, "Review report retrieved successfully", {
    review,
  });
});

/**
 * @desc    Download review report PDF
 * @route   GET /api/v1/reviews/:id/pdf
 * @access  Private
 */
export const downloadReviewPDF = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("project");

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=audit-report-${review.project?.repoName || "project"}.pdf`
  );

  const { pdfService } = await import("../services/pdf.service.js");
  pdfService.generateReviewPDF(review, res);
});

/**
 * @desc    Get all reviews for current user
 * @route   GET /api/v1/reviews
 * @access  Private
 */
export const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("project");

  return ApiResponse.success(res, 200, "All user reviews retrieved successfully", {
    reviews,
  });
});

/**
 * @desc    Get recent public reviews
 * @route   GET /api/v1/reviews/public
 * @access  Public
 */
export const getPublicReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("project");

  return ApiResponse.success(res, 200, "Public reviews retrieved successfully", {
    reviews,
  });
});
