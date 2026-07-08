import { body } from "express-validator";

/**
 * Validation rules for project endpoints.
 */
export const createProjectRules = [
  body("repoUrl")
    .trim()
    .notEmpty()
    .withMessage("Repository URL is required")
    .isURL({ protocols: ["http", "https"], require_tld: true, require_protocol: true })
    .withMessage("Please provide a valid URL")
    .matches(/github\.com\/[^/]+\/[^/]+/)
    .withMessage("Please provide a valid GitHub repository URL"),
];
