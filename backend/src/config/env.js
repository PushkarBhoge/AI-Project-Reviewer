import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 5000,

  // MongoDB
  MONGO_URI: process.env.MONGO_URI,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // GitHub
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,

  // AI / Gemini
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  // Frontend
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
};
