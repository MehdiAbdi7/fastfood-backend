import { rateLimit } from "express-rate-limit";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "../utils/responseFormatter.js";

// Limiteur strict pour le login : protège contre le bruteforce de mot de passe
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // 5 tentatives max par IP sur cette fenêtre
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    const resetTime = (req as any).rateLimit?.resetTime ?? new Date();
    const diffMs = resetTime.getTime() - Date.now();
    const diffMinutes = Math.max(1, Math.ceil(diffMs / 1000 / 60));

    errorResponse(
      res,
      `Trop de tentatives de connexion, réessayez dans ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`,
      StatusCodes.TOO_MANY_REQUESTS,
    );
  },
});

// Limiteur pour la création de commandes : route publique, mais on évite le spam/bot
export const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 commandes max par IP sur cette fenêtre
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    errorResponse(
      res,
      "Trop de commandes créées, réessayez plus tard",
      StatusCodes.TOO_MANY_REQUESTS,
    );
  },
});
