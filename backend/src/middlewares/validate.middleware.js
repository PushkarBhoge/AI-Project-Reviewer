import { body, param, validationResult } from "express-validator";

/**
 * Runs validation rules and returns 400 with errors if any fail.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Re-export for convenience
export { body, param };
