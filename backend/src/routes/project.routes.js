import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
} from "../controllers/project.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createProjectRules } from "../validators/project.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

// All project routes require authentication
router.use(authenticate);

router
  .route("/")
  .get(getProjects)
  .post(createProjectRules, validate, createProject);

router.route("/:id").get(getProjectById).delete(deleteProject);

export default router;
