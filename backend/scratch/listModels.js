import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(".env") });

const run = async () => {
  try {
    const key = process.env.GEMINI_API_KEY;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    
    if (data.models) {
      console.log("=== Supported Gemini Models ===");
      data.models.forEach((m) => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`- ${m.name} (${m.displayName})`);
        }
      });
    } else {
      console.log("No models found. Error:", data);
    }
  } catch (err) {
    console.error(err);
  }
};

run();
