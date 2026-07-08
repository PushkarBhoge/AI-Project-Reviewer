import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    repoUrl: {
      type: String,
      required: [true, "GitHub repository URL is required"],
      trim: true,
    },
    repoName: {
      type: String,
      required: true,
      trim: true,
    },
    repoOwner: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "",
    },
    stars: {
      type: Number,
      default: 0,
    },
    forks: {
      type: Number,
      default: 0,
    },
    topics: [
      {
        type: String,
      },
    ],
    defaultBranch: {
      type: String,
      default: "main",
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "completed", "failed"],
      default: "pending",
    },
    scanResult: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews count
projectSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "project",
});

const Project = mongoose.model("Project", projectSchema);
export default Project;
