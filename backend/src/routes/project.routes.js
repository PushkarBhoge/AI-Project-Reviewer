import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
} from "../controllers/project.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createProjectRules } from "../validators/project.validator.js";
import { validate, param } from "../middlewares/validate.middleware.js";

const router = Router();

const projectIdParam = param("id")
  .isMongoId()
  .withMessage("Invalid project ID");

// All project routes require authentication
router.use(authenticate);

router
  .route("/")
  .get(getProjects)
  .post(createProjectRules, validate, createProject);

router
  .route("/:id")
  .get(projectIdParam, validate, getProjectById)
  .delete(projectIdParam, validate, deleteProject);

export default router;
