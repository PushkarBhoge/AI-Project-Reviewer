import fs from "fs/promises";
import path from "path";
import Project from "../models/project.model.js";
import Review from "../models/review.model.js";
import { GitHubService } from "./github.service.js";
import { ScannerService } from "./scanner.service.js";
import { ParserService } from "./parser.service.js";
import { AIService } from "./ai.service.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/ApiError.js";

const githubService = new GitHubService();
const scannerService = new ScannerService();
const parserService = new ParserService();
const aiService = new AIService();

// A simple dictionary to keep track of active reviews progress for SSE streaming
export const activeReviewProgress = new Map();

/**
 * Orchestrates the full repository analysis and AI review pipeline.
 * @param {string} projectId MongoDB Project ID
 * @param {string} userId MongoDB User ID
 */
export const runReviewPipeline = async (projectId, userId) => {
  let tempRepoPath = null;
  
  // Helper to update progress state
  const updateProgress = (stage, message, percent) => {
    activeReviewProgress.set(projectId, { stage, message, percent });
    logger.info(`Project ${projectId} Progress: [${stage}] ${message} (${percent}%)`);
  };

  try {
    updateProgress("starting", "Initializing pipeline...", 5);

    // 1. Fetch project from DB
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // 2. Update status to reviewing
    project.status = "reviewing";
    await project.save();

    updateProgress("github_download", "Downloading repository ZIP archive from GitHub...", 15);
    const { owner, repo } = githubService.validateRepoUrl(project.repoUrl);
    
    // Download and extract zip
    tempRepoPath = await githubService.downloadRepository(owner, repo, project.defaultBranch);

    updateProgress("scanning", "Scanning repository files and directories...", 35);
    // Get file tree
    const fileTree = await githubService.fetchFileTree(tempRepoPath);

    // Run scanner
    const scanResult = await scannerService.scan(tempRepoPath, fileTree);

    // Update project with scanResult
    project.scanResult = scanResult;
    project.language = scanResult.language || project.language;
    await project.save();

    updateProgress("parsing", "Parsing code files for metrics and smells...", 50);
    // Run static code parsing
    const parserResult = await parserService.parse(fileTree);

    updateProgress("ai_context", "Preparing source code files for AI review...", 65);
    // Read contents of important files (limit count to avoid exceeding tokens)
    // Priority: main/src folders, config files, routes, app files, components. Skip large files or test files if possible.
    const eligibleFiles = fileTree.filter((file) => {
      const p = file.path.toLowerCase();
      // Skip binary, lock, asset files
      return (
        /\.(js|jsx|ts|tsx|py|java|go)$/i.test(file.name) &&
        !p.includes("node_modules") &&
        !p.includes("package-lock") &&
        !p.includes("yarn.lock") &&
        !p.includes("pnpm-lock") &&
        !p.includes("dist") &&
        !p.includes("build") &&
        file.size < 150000 // < 150KB
      );
    });

    // Sort to prioritize controllers, routes, configuration files, and main entry files
    eligibleFiles.sort((a, b) => {
      const keywords = ["app", "index", "server", "route", "controller", "config", "auth"];
      const score = (p) => {
        let sc = 10;
        keywords.forEach((key, idx) => {
          if (p.toLowerCase().includes(key)) sc -= idx;
        });
        if (p.includes("test") || p.includes("spec")) sc += 20; // push tests down
        return sc;
      };
      return score(a.path) - score(b.path);
    });

    // Pick top 15 files
    const topFiles = eligibleFiles.slice(0, 15);
    const fileContents = [];

    for (const file of topFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, "utf8");
        fileContents.push({
          path: file.path,
          content,
        });
      } catch (err) {
        logger.error(`Error reading ${file.path} for AI context: ${err.message}`);
      }
    }

    updateProgress("ai_analysis", "Analyzing codebase using Gemini Generative AI...", 80);
    // Call Gemini AI review
    const aiReview = await aiService.analyzeProject(scanResult, parserResult, fileContents);

    updateProgress("saving", "Saving audit report to database...", 95);

    // 3. Create Review in DB
    const review = await Review.create({
      project: project._id,
      user: userId,
      overallScore: aiReview.overallScore || 0,
      summary: aiReview.summary || "",
      categories: {
        codeQuality: aiReview.categories?.codeQuality || { score: 0, feedback: "" },
        security: aiReview.categories?.security || { score: 0, feedback: "" },
        performance: aiReview.categories?.performance || { score: 0, feedback: "" },
        documentation: aiReview.categories?.documentation || { score: 0, feedback: "" },
        bestPractices: aiReview.categories?.bestPractices || aiReview.categories?.architecture || { score: 0, feedback: "" },
        testing: aiReview.categories?.testing || { score: 0, feedback: "" },
        uiux: aiReview.categories?.uiux || { score: 0, feedback: "" },
      },
      suggestions: aiReview.suggestions || [],
      recommendations: aiReview.recommendations || [],
    });

    // 4. Mark project status as completed
    project.status = "completed";
    await project.save();

    updateProgress("complete", "Review completed successfully!", 100);

    // Cleanup progress after 30 seconds
    setTimeout(() => {
      activeReviewProgress.delete(projectId);
    }, 30000);

    return review;
  } catch (error) {
    logger.error(`Review pipeline failed for project ${projectId}: ${error.message}`);
    
    // Mark project as failed
    try {
      await Project.findByIdAndUpdate(projectId, { status: "failed" });
    } catch (dbErr) {
      logger.error(`Failed to update project failure status: ${dbErr.message}`);
    }

    updateProgress("failed", `Review failed: ${error.message}`, 100);

    setTimeout(() => {
      activeReviewProgress.delete(projectId);
    }, 30000);

    throw error;
  } finally {
    // 5. Cleanup temporary folder (parent folder of root owner-repo folder)
    if (tempRepoPath) {
      const parentTempDir = path.dirname(tempRepoPath);
      await githubService.cleanup(parentTempDir);
    }
  }
};
