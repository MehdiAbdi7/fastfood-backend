import { Router } from "express";
import { checkUser, login, register } from "../controllers/auth.controller.js";
import { CheckAuth, isAdmin } from "../middlewares/auth.js";
import { validateBodySchema } from "../middlewares/validations.js";
import { loginSchema, registerSchema } from "../validation/user.js";

const authRouter = Router();

authRouter.get("/", CheckAuth, checkUser);
authRouter.post(
  "/register",
  CheckAuth,
  isAdmin,
  validateBodySchema(registerSchema),
  register,
);
authRouter.post("/login", validateBodySchema(loginSchema), login);

export default authRouter;
