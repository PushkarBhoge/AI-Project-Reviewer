import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 20 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    feedback: { type: String, default: "" },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    summary: {
      type: String,
      default: "",
    },
    categories: {
      codeQuality: { type: categorySchema, default: () => ({}) },
      security: { type: categorySchema, default: () => ({}) },
      performance: { type: categorySchema, default: () => ({}) },
      documentation: { type: categorySchema, default: () => ({}) },
      bestPractices: { type: categorySchema, default: () => ({}) }, // maps to architecture
      testing: { type: categorySchema, default: () => ({}) },
      uiux: { type: categorySchema, default: () => ({}) },
    },
    suggestions: [
      {
        file: String,
        line: Number,
        severity: {
          type: String,
          enum: ["info", "warning", "critical"],
          default: "info",
        },
        message: String,
        solution: String,
        originalCode: String,
        codeSnippet: String,
        prUrl: String,
      },
    ],
    recommendations: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
