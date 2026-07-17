import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";

const app = express();

// middlewares
app.set("trust proxy", true);

app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  }),
);

app.use(helmet());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// routes
app.use("/auth", authRouter);

// route de test
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// not found route
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// error route
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  },
);

export default app;
