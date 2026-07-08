import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import Project from "../models/project.model.js";
import { activeReviewProgress } from "../services/review.pipeline.js";
import { logger } from "../config/logger.js";

const router = Router();

/**
 * Server-Sent Events (SSE) route to stream review progress.
 * GET /api/v1/reviews/:projectId/progress
 */
router.get("/:projectId/progress", authenticate, async (req, res) => {
  const { projectId } = req.params;

  // 1. Verify project exists and belongs to user
  const project = await Project.findOne({ _id: projectId, user: req.user._id });
  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  // 2. Setup headers for SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Credentials": "true",
  });

  // Send initial signal
  res.write("retry: 5000\n\n");

  const sendProgress = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  logger.info(`SSE Connection opened for project: ${projectId}`);

  // Send first state
  const initialProgress = activeReviewProgress.get(projectId) || {
    stage: project.status === "reviewing" ? "processing" : "idle",
    message: project.status === "reviewing" ? "Review is running..." : "Waiting to start...",
    percent: project.status === "reviewing" ? 10 : 0,
  };
  sendProgress(initialProgress);

  // Poll progress state
  const intervalId = setInterval(async () => {
    const progress = activeReviewProgress.get(projectId);
    
    if (progress) {
      sendProgress(progress);
      
      if (progress.stage === "complete" || progress.stage === "failed") {
        clearInterval(intervalId);
        res.end();
      }
    } else {
      // If no active review is in memory, check DB status
      try {
        const currentProject = await Project.findById(projectId);
        if (currentProject) {
          if (currentProject.status === "completed") {
            sendProgress({ stage: "complete", message: "Finished!", percent: 100 });
            clearInterval(intervalId);
            res.end();
          } else if (currentProject.status === "failed") {
            sendProgress({ stage: "failed", message: "Review failed.", percent: 100 });
            clearInterval(intervalId);
            res.end();
          } else if (currentProject.status === "pending") {
            sendProgress({ stage: "idle", message: "Waiting to start...", percent: 0 });
          }
        }
      } catch (err) {
        logger.error(`SSE Database check error: ${err.message}`);
      }
    }
  }, 1500);

  // If connection is closed by user, clear interval
  req.on("close", () => {
    logger.info(`SSE Connection closed by client for project: ${projectId}`);
    clearInterval(intervalId);
    res.end();
  });
});

export default router;
