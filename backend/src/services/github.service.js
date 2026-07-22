import { Octokit } from "@octokit/rest";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../config/logger.js";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import AdmZip from "adm-zip";
import axios from "axios";

export class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: env.GITHUB_TOKEN || undefined,
    });
  }

  /**
   * Parse and validate GitHub URL.
   * Format: https://github.com/owner/repo
   */
  validateRepoUrl(url) {
    if (!url) {
      throw new ApiError(400, "Repository URL is required");
    }

    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname !== "github.com") {
        throw new ApiError(400, "Only GitHub repository URLs are supported");
      }

      const paths = parsedUrl.pathname.split("/").filter(Boolean);
      if (paths.length < 2) {
        throw new ApiError(400, "Invalid GitHub repository URL. Must be in the format github.com/owner/repo");
      }

      const owner = paths[0];
      const repo = paths[1].replace(/\.git$/, "");

      return { owner, repo };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "Invalid repository URL format");
    }
  }

  /**
   * Fetch repository metadata from GitHub.
   */
  async fetchRepoMetadata(owner, repo) {
    try {
      const { data } = await this.octokit.repos.get({
        owner,
        repo,
      });

      return {
        repoName: data.name,
        repoOwner: data.owner.login,
        description: data.description || "",
        language: data.language || "",
        stars: data.stargazers_count || 0,
        forks: data.forks_count || 0,
        topics: data.topics || [],
        defaultBranch: data.default_branch || "main",
      };
    } catch (error) {
      logger.error(`Error fetching GitHub metadata for ${owner}/${repo}: ${error.message}`);
      if (error.status === 404) {
        throw new ApiError(404, `Repository '${owner}/${repo}' not found or is private.`);
      }
      throw new ApiError(500, `Failed to retrieve metadata from GitHub: ${error.message}`);
    }
  }

  /**
   * Download repository ZIP, extract to a temporary folder, and return folder path.
   */
  async downloadRepository(owner, repo, branch = "main") {
    const tempDir = path.resolve("tmp/repos");
    const downloadPath = path.join(tempDir, `${owner}-${repo}-${Date.now()}`);

    try {
      // 1. Ensure temp dir exists
      await fs.mkdir(tempDir, { recursive: true });

      // 2. Fetch the ZIP redirect URL from GitHub
      logger.info(`Getting ZIP download link for ${owner}/${repo} (${branch})...`);
      let archiveUrl;
      try {
        const response = await this.octokit.repos.downloadZipballArchive({
          owner,
          repo,
          ref: branch,
          request: {
            redirect: "manual",
          },
        });
        // Octokit downloadZipballArchive with redirect: manual returns 302 and headers.location holds the direct link.
        archiveUrl = response.headers.location;
      } catch (err) {
        if (err.status === 302 || err.status === 301) {
          archiveUrl = err.headers.location;
        } else {
          throw err;
        }
      }

      if (!archiveUrl) {
        // Fallback: try default fetch
        archiveUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;
      }

      // 3. Download zip content
      logger.info(`Downloading ZIP archive for ${owner}/${repo}...`);
      const headers = env.GITHUB_TOKEN ? { Authorization: `token ${env.GITHUB_TOKEN}` } : {};
      const zipResponse = await axios({
        method: "get",
        url: archiveUrl,
        responseType: "arraybuffer",
        headers: {
          ...headers,
          "User-Agent": "AI-Project-Reviewer",
        },
      });

      // 4. Extract directly from in-memory buffer using adm-zip (prevents Windows file lock EBUSY errors)
      logger.info(`Extracting ZIP archive for ${owner}/${repo}...`);
      const zipBuffer = Buffer.from(zipResponse.data);
      const zip = new AdmZip(zipBuffer);
      zip.extractAllTo(downloadPath, true);

      // GitHub ZIP has a root folder named like: owner-repo-hash
      // We find that single directory and return its path
      const files = await fs.readdir(downloadPath);
      if (files.length === 1) {
        const nestedPath = path.join(downloadPath, files[0]);
        const stat = await fs.stat(nestedPath);
        if (stat.isDirectory()) {
          return nestedPath;
        }
      }

      return downloadPath;
    } catch (error) {
      logger.error(`Error downloading repository ${owner}/${repo}: ${error.message}`);
      throw new ApiError(500, `Failed to download repository: ${error.message}`);
    }
  }

  /**
   * Recursively get all files under the directory.
   */
  async fetchFileTree(dirPath, baseDir = dirPath) {
    let results = [];
    const list = await fs.readdir(dirPath);

    for (const file of list) {
      // Skip common folders to avoid excessive scans
      if (
        [
          "node_modules",
          ".git",
          "dist",
          "build",
          "coverage",
          ".next",
          "venv",
          "env",
          "__pycache__",
          ".expo",
          "out",
        ].includes(file)
      ) {
        continue;
      }

      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        const subdirResults = await this.fetchFileTree(filePath, baseDir);
        results = results.concat(subdirResults);
      } else {
        const relativePath = path.relative(baseDir, filePath).replace(/\\/g, "/");
        results.push({
          name: file,
          path: relativePath,
          absolutePath: filePath,
          size: stat.size,
        });
      }
    }

    return results;
  }

  /**
   * Remove temporary files.
   */
  async cleanup(dirPath) {
    try {
      if (existsSync(dirPath)) {
        await fs.rm(dirPath, { recursive: true, force: true });
        logger.info(`Cleaned up temporary directory: ${dirPath}`);
      }
    } catch (error) {
      logger.error(`Failed to clean up temp dir ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Automatically create a GitHub branch, commit the suggested fix, and open a Pull Request.
   */
  async createFixPullRequest({ owner, repo, baseBranch = "main", filePath, originalCode, codeSnippet, message, solution }) {
    try {
      logger.info(`Initiating GitHub PR creation for ${owner}/${repo} file: ${filePath}`);

      // 1. Get latest commit SHA of default branch
      let refData;
      try {
        const { data } = await this.octokit.git.getRef({
          owner,
          repo,
          ref: `heads/${baseBranch}`,
        });
        refData = data;
      } catch (refErr) {
        const { data } = await this.octokit.git.getRef({
          owner,
          repo,
          ref: "heads/master",
        });
        refData = data;
        baseBranch = "master";
      }

      const latestCommitSha = refData.object.sha;

      // 2. Create new patch branch
      const branchName = `ai-fix-${Date.now()}`;
      await this.octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: latestCommitSha,
      });

      // 3. Fetch existing file content from repo
      const { data: fileData } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branchName,
      });

      const currentContent = Buffer.from(fileData.content, "base64").toString("utf8");

      // 4. Compute updated file content
      let updatedContent = currentContent;
      if (originalCode && currentContent.includes(originalCode.trim())) {
        updatedContent = currentContent.replace(originalCode.trim(), codeSnippet.trim());
      } else {
        updatedContent = currentContent + `\n\n// AI Suggested Fix:\n${codeSnippet.trim()}\n`;
      }

      // 5. Commit updated file to branch
      await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: `fix(ai-audit): ${message ? message.substring(0, 50) : "Apply AI code fix"}`,
        content: Buffer.from(updatedContent).toString("base64"),
        sha: fileData.sha,
        branch: branchName,
      });

      // 6. Create Pull Request
      const prTitle = `[AI Fix] Resolve code issue in ${path.basename(filePath)}`;
      const prBody = `## 🤖 AI Automated Code Fix

**File:** \`${filePath}\`
**Issue Identified:** ${message || "Code quality / security enhancement"}

### 💡 Proposed Solution
${solution || "Applied AI recommended refactoring for performance and security."}

### 📝 Code Changes Made
\`\`\`
${codeSnippet}
\`\`\`

---
*Generated automatically by AI Project Reviewer.*`;

      const { data: pr } = await this.octokit.pulls.create({
        owner,
        repo,
        title: prTitle,
        head: branchName,
        base: baseBranch,
        body: prBody,
      });

      logger.info(`Successfully created GitHub PR: ${pr.html_url}`);
      return pr.html_url;
    } catch (error) {
      logger.error(`Failed to create GitHub Pull Request: ${error.message}`);
      throw new ApiError(500, `Failed to create GitHub Pull Request: ${error.message}`);
    }
  }
}
