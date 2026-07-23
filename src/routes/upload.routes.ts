import { Router } from "express";
import { CheckAuth, isAdmin } from "../middlewares/auth.js";
import { uploadImage } from "../middlewares/upload.js";
import { uploadMenuItemImage } from "../controllers/upload.controller.js";

const uploadRouter = Router();

uploadRouter.post(
  "/menu-item-image",
  CheckAuth,
  isAdmin,
  uploadImage.single("image"),
  uploadMenuItemImage,
);

export default uploadRouter;
