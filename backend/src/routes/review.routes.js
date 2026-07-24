import { Router } from "express";
import {
  createReview,
  getReviewsByProject,
  getReviewById,
  downloadReviewPDF,
  getUserReviews,
  getPublicReviews,
  createSuggestionPR,
} from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate, param } from "../middlewares/validate.middleware.js";
import { projectIdParam, reviewIdParam } from "../validators/review.validator.js";

const router = Router();

const suggestionIndexParam = [
  param("suggestionIndex")
    .notEmpty()
    .withMessage("Suggestion index is required")
    .isInt({ min: 0 })
    .withMessage("Suggestion index must be a non-negative integer"),
];

// Public routes
router.get("/public", getPublicReviews);

// All review routes require authentication
router.use(authenticate);

router.route("/").get(getUserReviews);
router.post("/:projectId", projectIdParam, validate, createReview);
router.get("/project/:projectId", projectIdParam, validate, getReviewsByProject);
router.get("/:id/pdf", reviewIdParam, validate, downloadReviewPDF);
router
  .route("/:id/suggestions/:suggestionIndex/pr")
  .post(reviewIdParam, suggestionIndexParam, validate, createSuggestionPR);
router.get("/:id", reviewIdParam, validate, getReviewById);

export default router;
