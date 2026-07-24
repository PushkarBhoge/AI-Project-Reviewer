import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ai-project-reviewer";

const oldUserId = "6a4e55c11fe470528c5742e8";
const newUserId = "6a63619617387feb04394f07";

async function runMigration() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    const projectsCollection = db.collection("projects");
    const reviewsCollection = db.collection("reviews");

    const oldObjId = new mongoose.Types.ObjectId(oldUserId);
    const newObjId = new mongoose.Types.ObjectId(newUserId);

    // 1. Reassign Projects
    const projectRes = await projectsCollection.updateMany(
      { user: oldObjId },
      { $set: { user: newObjId } }
    );
    console.log(`[Projects] Reassigned ${projectRes.modifiedCount} projects to new Clerk user.`);

    // 2. Reassign Reviews
    const reviewRes = await reviewsCollection.updateMany(
      { user: oldObjId },
      { $set: { user: newObjId } }
    );
    console.log(`[Reviews] Reassigned ${reviewRes.modifiedCount} audits/reviews to new Clerk user.`);

    // 3. Update Token Balance for New User
    const oldUser = await usersCollection.findOne({ _id: oldObjId });
    const tokensToSet = oldUser?.tokens ?? 143;

    const userRes = await usersCollection.updateOne(
      { _id: newObjId },
      { $set: { tokens: tokensToSet } }
    );
    console.log(`[Tokens] Set token balance for Clerk user (${newUserId}) to ${tokensToSet} tokens.`);

    console.log("SUCCESS: Database migration completed!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

runMigration();
