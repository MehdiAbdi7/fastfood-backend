import mongoose from "mongoose";
import dns from "node:dns";
import { logger } from "./logger.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

mongoose.set("debug", process.env.NODE_ENV === "development");

export async function connectDB() {
  try {
    const username = encodeURIComponent(process.env.MONGODB_USERNAME!);
    const password = encodeURIComponent(process.env.MONGODB_PASSWORD!);
    const host = process.env.MONGODB_HOST!;
    const dbName = process.env.MONGODB_DB_NAME!;
    const appName = process.env.MONGODB_APP_NAME!;

    const uri =
      `mongodb+srv://${username}:${password}` +
      `@${host}/${dbName}` +
      `?retryWrites=true&w=majority&appName=${appName}`;

    await mongoose.connect(uri);

    logger.info("MongoDB connected");
    console.log("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection failed", {
      error: err instanceof Error ? err.message : err,
    });

    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
