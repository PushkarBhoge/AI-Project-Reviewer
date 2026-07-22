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

const router = Router();

// Public routes
router.get("/public", getPublicReviews);

// All review routes require authentication
router.use(authenticate);

router.route("/").get(getUserReviews);
router.post("/:projectId", createReview);
router.get("/project/:projectId", getReviewsByProject);
router.get("/:id/pdf", downloadReviewPDF);
router.post("/:id/suggestions/:suggestionIndex/pr", createSuggestionPR);
router.get("/:id", getReviewById);

export default router;
