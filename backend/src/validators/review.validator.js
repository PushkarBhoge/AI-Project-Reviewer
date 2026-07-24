import { param } from "express-validator";

export const projectIdParam = [
  param("projectId")
    .notEmpty()
    .withMessage("Project ID is required")
    .isMongoId()
    .withMessage("Invalid project ID"),
];

export const reviewIdParam = [
  param("id")
    .notEmpty()
    .withMessage("Review ID is required")
    .isMongoId()
    .withMessage("Invalid review ID"),
];
