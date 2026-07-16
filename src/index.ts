import "dotenv/config";
import app from "./app.js";
import { logger } from "./config/logger.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

await connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
