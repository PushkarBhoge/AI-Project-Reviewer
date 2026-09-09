import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../config/logger.js";

export class AIService {
  constructor() {
    if (!env.GEMINI_API_KEY) {
      logger.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI reviews will fail.");
    }
    // Initialize Google Gen AI
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "dummy_key");
  }

  /**
   * Run the AI review on the scanned codebase.
   * @param {Object} scanResult Summary metrics from ScannerService.
   * @param {Object} parserResult Structural findings from ParserService.
   * @param {Array} fileContents Array of { path, content } containing code content.
   */
  async analyzeProject(scanResult, parserResult, fileContents, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        logger.info(`Initializing Gemini AI analysis (Attempt ${attempt})...`);
        const model = this.genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      // 1. Build codebase context snippet
      let codebaseContext = "";
      fileContents.forEach((file) => {
        // Truncate file content if it's too long (limit to 4000 characters per file)
        const fileContentSnippet = file.content.length > 4000 
          ? file.content.substring(0, 4000) + "\n... [TRUNCATED FOR LENGTH] ..."
          : file.content;

        codebaseContext += `\n=== FILE: ${file.path} ===\n${fileContentSnippet}\n======================\n`;
      });

      // 2. Build the system & user prompts
      const systemInstruction = `You are a world-class Principal Software Architect, Polyglot Systems Engineer, and Cybersecurity Auditor.
You possess deep, production-grade expertise across ALL software engineering domains and paradigms:
- Web & Frontend Applications (React, Next.js, Vue, Angular, Svelte, static web)
- Backend Services, APIs & Microservices (Node/Express/Nest, Python/FastAPI/Django/Flask, Go, Java/Spring Boot, C#/.NET, Rust, PHP, Ruby)
- Command-Line Tools, CLI Utilities & Shell Scripts (argparse, click, commander, cobra, clap, bash)
- Reusable Libraries, SDKs & Open-Source Packages (npm, PyPI, Crates, Go modules, RubyGems)
- Mobile Applications (React Native, Flutter, Swift/iOS, Kotlin/Android)
- Data Science, Machine Learning & AI Workflows (PyTorch, TensorFlow, Pandas, ETL pipelines, training/inference scripts)
- Systems, Embedded & Desktop Software (C, C++, Rust, Electron, Tauri)
- Cloud-Native & DevOps (Docker, CI/CD pipelines, IaC, Kubernetes)

Your mission is to perform a rigorous, highly contextual, domain-aware code audit of the provided repository and return a structured JSON evaluation report.
Be detailed, critical, and provide practical, language-idiomatic refactoring advice.
For scores:
- Categories have a maximum score of 20.
- Overall score is out of 100, which is an aggregated reflection of the project's production-readiness.

You MUST follow the JSON schema provided below. Do not return any other text besides the JSON.`;

      const prompt = `Here is the metadata and static scan of the project:
FRAMEWORK: ${scanResult.framework}
PRIMARY LANGUAGE: ${scanResult.language}
TOTAL FILES: ${scanResult.totalFiles}
TOTAL LOC (approx): ${scanResult.totalLinesOfCode}
DEPENDENCIES: ${JSON.stringify(scanResult.dependencies.production)}
CONFIG FILES DETECTED: ${JSON.stringify(scanResult.configFiles)}
LICENSE: ${scanResult.license}

STATIC CODE SMELLS (PARSER):
Total Functions: ${parserResult.totalFunctions}
Total Classes: ${parserResult.totalClasses}
Complexity Alerts: ${JSON.stringify(parserResult.complexityAlerts)}
Static Code Smells: ${JSON.stringify(parserResult.smells)}
Security Leak Warnings: ${JSON.stringify(parserResult.securityAlerts)}

PROJECT CODEFILES (RELEVANT PORTIONS):
${codebaseContext}

AUDIT INSTRUCTIONS:
1. First, identify the primary PROJECT ARCHETYPE (e.g., Backend API / Microservice, Frontend / Web App, Full-stack Web App, CLI Tool / Utility, Reusable Library / SDK, Mobile App, Data Science / ML Pipeline, or Systems / Low-level Software) from the dependencies, configuration, and source files.
2. Evaluate the codebase strictly within the context of its archetype and programming language:
   - "architecture" (or "bestPractices"):
     * Web/Frontend: Component hierarchy, state management, UI/business logic separation.
     * Backend/APIs: Layered separation (controllers/routes, services/business logic, data models/repositories), middleware flow, connection management, dependency injection.
     * CLI/Tools: Command-routing/dispatch pattern, separation of CLI parsing from core business logic, modular execution.
     * Libraries/SDKs: Clean public API export surface, loose coupling, extensibility, minimal external dependency footprint.
     * Data/ML: Pipeline modularity, reproducible runs, configuration separation from model logic.
     * Systems/Low-level: Resource lifecycle management (RAII), modular driver/subsystem boundaries.
   - "security":
     * Web/Frontend: XSS, CSRF, insecure token storage, open redirects, exposed sensitive client keys.
     * Backend/APIs: Injection vulnerabilities (SQL, NoSQL, command), auth/authz (JWT, RBAC), input validation/sanitization, rate limiting, CORS configuration, secrets management.
     * CLI/Tools: Command injection, unsafe shell execution, arbitrary file traversal/writes, insecure temp files, privilege handling.
     * Libraries/SDKs: Dependency vulnerabilities, prototype pollution, safe deserialization, safe memory handling.
     * Universal: Hardcoded secrets, API keys, credentials, leaked stack traces.
   - "performance":
     * Web/Frontend: Bundle size, unnecessary re-renders, asset optimization, lazy loading.
     * Backend/APIs: Async non-blocking I/O, database query efficiency (N+1 queries, indexing), caching strategies, connection pooling, event-loop blocking.
     * CLI/Tools: Startup latency, streaming I/O for large files or stdout/stdin, memory footprint.
     * Libraries/SDKs: Algorithmic complexity (time/space), zero-overhead abstractions, tree-shakeability.
     * Data/ML: Vectorized operations (NumPy/Pandas vs slow Python loops), GPU batching, data generator pipelines.
     * Systems: Memory leaks, CPU cache locality, concurrency locks, resource cleanup.
   - "documentation":
     * README clarity, installation/getting-started guide, usage examples, configuration parameters/env vars, API/CLI references, and license.
   - "codeQuality":
     * Idiomatic code adhering to the language's best conventions (e.g., PEP 8 for Python, Effective Go, modern TypeScript/ESNext, Rust idioms, modern C++ patterns). DRY, SOLID, clean naming, defensive error handling.
   - "testing":
     * Automated test coverage, unit/integration/E2E test quality, test assertions, mocking, and edge-case coverage appropriate for the project type.
   - "uiux" (UI/UX & Developer Experience):
     * If Graphical Web / Mobile / Desktop: Evaluate visual design hierarchy, responsiveness, accessibility (WCAG/ARIA), themes/dark mode, and user feedback states (loading/error/empty).
     * If Backend API / Service: Evaluate Developer Experience (DX) & API Design (RESTful/GraphQL consistency, predictable JSON envelope structures, proper HTTP status codes, informative error payloads, versioning, pagination).
     * If CLI Tool / Terminal App: Evaluate Command-Line UX / Ergonomics (clear --help documentation, intuitive flag/argument design, colored/formatted terminal outputs, progress feedback, non-zero exit codes on error).
     * If Library / SDK / Package: Evaluate Developer Experience (DX) & Public Interface Ergonomics (clean class/method signatures, sensible defaults, comprehensive TypeScript type definitions or docstrings, minimal consumer boilerplate).
     * If Data / ML / Script: Evaluate Operator Experience (clear parameterization, informative logging/progress indicators, unambiguous output file saving).
3. Provide concrete refactoring suggestions with real, runnable code snippets in the project's actual programming language. For each suggestion, "severity" MUST be strictly one of: "critical" (security flaws, fatal crashes, data leaks), "warning" (code smells, performance bottlenecks, architecture anti-patterns), or "info" (best practices, style, documentation). Do not use any other severity values.

Output Schema:
{
  "overallScore": 85,
  "summary": "Executive summary paragraph covering project archetype, status, and overall readiness",
  "categories": {
    "architecture": {
      "score": 16,
      "maxScore": 20,
      "strengths": ["list of strengths as strings"],
      "weaknesses": ["list of weaknesses as strings"],
      "feedback": "detailed review paragraph"
    },
    "security": {
      "score": 18,
      "maxScore": 20,
      "strengths": [],
      "weaknesses": [],
      "feedback": ""
    },
    "performance": {
      "score": 15,
      "maxScore": 20,
      "strengths": [],
      "weaknesses": [],
      "feedback": ""
    },
    "documentation": {
      "score": 17,
      "maxScore": 20,
      "strengths": [],
      "weaknesses": [],
      "feedback": ""
    },
    "codeQuality": {
      "score": 16,
      "maxScore": 20,
      "strengths": [],
      "weaknesses": [],
      "feedback": ""
    },
    "testing": {
      "score": 10,
      "maxScore": 20,
      "strengths": [],
      "weaknesses": [],
      "feedback": ""
    },
    "uiux": {
      "score": 12,
      "maxScore": 20,
      "strengths": [],
      "weaknesses": [],
      "feedback": ""
    }
  },
  "suggestions": [
    {
      "file": "path/relative/to/repo/file.ext",
      "line": 42,
      "severity": "critical", // MUST be strictly one of: "critical", "warning", or "info"
      "message": "Specific issue description detailing the code flaw or vulnerability",
      "solution": "Clear, actionable step-by-step instructions on how to solve this specific issue",
      "originalCode": "// Problematic code snippet as it currently exists in the repository\nconst raw = input;",
      "codeSnippet": "// Concise, production-ready code snippet showing how to resolve the issue\nconst clean = sanitize(input);"
    }
  ],
  "recommendations": [
    "Priority action item 1",
    "Priority action item 2"
  ]
}
`;

      logger.info("Sending prompt to Gemini API...");
      const result = await model.generateContent([
        { text: systemInstruction },
        { text: prompt }
      ]);

      const responseText = result.response.text();
      logger.info("Gemini API call completed. Parsing response...");

      return this.parseReviewResponse(responseText);
    } catch (error) {
      if (error.message.includes("Gemini generated an invalid JSON response format") && attempt <= maxRetries) {
        logger.warn(`JSON Parsing failed, retrying (${attempt}/${maxRetries})...`);
        continue;
      }
      logger.error(`Gemini AI Service Error: ${error.message}`);
      throw new ApiError(500, `AI Analysis failed: ${error.message}`);
    }
  }
}

  /**
   * Helper to parse AI response into structured review format.
   */
  parseReviewResponse(response) {
    try {
      // Find JSON block start and end if markdown wrappers are present
      let cleanJson = response.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.substring(7);
      }
      if (cleanJson.endsWith("```")) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      }
      cleanJson = cleanJson.trim();

      const parsed = JSON.parse(cleanJson);

      // Sanitize and normalize suggestions severity to ensure DB enum compatibility
      if (Array.isArray(parsed.suggestions)) {
        parsed.suggestions = parsed.suggestions.map((sug) => {
          const raw = String(sug.severity || "").toLowerCase().trim();
          let severity = "info";
          if (raw === "critical" || raw === "high" || raw === "blocker" || raw === "error") {
            severity = "critical";
          } else if (raw === "warning" || raw === "medium" || raw === "warn") {
            severity = "warning";
          }
          return {
            ...sug,
            severity,
          };
        });
      }

      return parsed;
    } catch (error) {
      logger.error(`JSON Parsing failed on Gemini response: ${error.message}. Raw response: ${response}`);
      throw new ApiError(500, "Gemini generated an invalid JSON response format.");
    }
  }
}
