import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import cloudinary from "../config/cloudinary.js";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";

export async function uploadMenuItemImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      errorResponse(res, "Aucune image envoyée", StatusCodes.BAD_REQUEST);
      return;
    }

    // Upload du buffer vers Cloudinary via un stream (pas de fichier temporaire sur disque)
    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "niwa-food/menu-items" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as { secure_url: string });
          },
        );
        uploadStream.end(req.file!.buffer);
      },
    );

    successResponse(
      res,
      { imageUrl: uploadResult.secure_url },
      "Image uploadée avec succès",
      StatusCodes.CREATED,
    );
  } catch (error) {
    next(error);
  }
}
