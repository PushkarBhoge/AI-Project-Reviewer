import Project from "../models/project.model.js";
import Review from "../models/review.model.js";
import { GitHubService } from "../services/github.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const githubService = new GitHubService();

/**
 * @desc    Submit a GitHub repo for review
 * @route   POST /api/v1/projects
 * @access  Private
 */
export const createProject = asyncHandler(async (req, res) => {
  const { repoUrl } = req.body;

  // 1. Validate & parse URL
  const { owner, repo } = githubService.validateRepoUrl(repoUrl);

  // 2. Check if user already added this repository
  const existingProject = await Project.findOne({
    user: req.user._id,
    repoOwner: owner,
    repoName: repo,
  });

  if (existingProject) {
    return ApiResponse.success(res, 200, "Project already exists", {
      project: existingProject,
    });
  }

  // 3. Fetch metadata from GitHub
  const metadata = await githubService.fetchRepoMetadata(owner, repo);

  // 4. Create project in DB
  const project = await Project.create({
    user: req.user._id,
    repoUrl,
    repoName: metadata.repoName,
    repoOwner: metadata.repoOwner,
    description: metadata.description,
    language: metadata.language,
    stars: metadata.stars,
    forks: metadata.forks,
    topics: metadata.topics,
    defaultBranch: metadata.defaultBranch,
    status: "pending",
  });

  return ApiResponse.success(res, 210, "Project created successfully", {
    project,
  });
});

/**
 * @desc    Get all projects for current user
 * @route   GET /api/v1/projects
 * @access  Private
 */
export const getProjects = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const total = await Project.countDocuments({ user: req.user._id });
  
  // Find projects and populate reviews count
  const projects = await Project.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "reviews",
      select: "_id overallScore createdAt",
    });

  return ApiResponse.success(res, 200, "Projects retrieved successfully", {
    projects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get single project by ID
 * @route   GET /api/v1/projects/:id
 * @access  Private
 */
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("reviews");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return ApiResponse.success(res, 200, "Project retrieved successfully", {
    project,
  });
});

/**
 * @desc    Delete a project
 * @route   DELETE /api/v1/projects/:id
 * @access  Private
 */
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // 1. Delete associated reviews
  await Review.deleteMany({ project: project._id });

  // 2. Delete the project itself
  await Project.deleteOne({ _id: project._id });

  return ApiResponse.success(res, 200, "Project and associated reviews deleted successfully");
});
