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
      const systemInstruction = `You are an elite, senior software architect, security auditor, and UI/UX expert.
Your job is to perform a rigorous review of a codebase and output a structured JSON report.
Be detailed, critical, and provide practical refactoring advice.
For scores:
- Categories have a maximum score of 20.
- Overall score is out of 100, which is the sum of (architecture + security + performance + documentation + codeQuality) or scaled/aggregated from all category scores.

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

Task: Conduct a complete audit of this codebase and fill out the JSON schema below.
Ensure strengths/weaknesses and suggestions are custom-tailored to the actual code files provided.
If files or components suggest UI structures, evaluate accessibility, dark mode, responsive styles (Tailwind, CSS) under the uiux category.
If config or source code suggests testing libraries (Jest, PyTest), evaluate coverage under testing.

Output Schema:
{
  "overallScore": 85,
  "summary": "Short executive summary paragraph of code status",
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
      "file": "path/relative/to/repo/file.js",
      "line": 42,
      "severity": "critical", // info, warning, critical
      "message": "Specific error description and how to fix it"
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
      return parsed;
    } catch (error) {
      logger.error(`JSON Parsing failed on Gemini response: ${error.message}. Raw response: ${response}`);
      throw new ApiError(500, "Gemini generated an invalid JSON response format.");
    }
  }
}
