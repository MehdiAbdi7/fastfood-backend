import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";

export async function login(req: Request, res: Response, next: NextFunction) {
  const { password, email } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      errorResponse(res, "Invalid email or password", StatusCodes.UNAUTHORIZED);
      return;
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      errorResponse(res, "Invalid email or password", StatusCodes.UNAUTHORIZED);
      return;
    }

    const userInfo = { id: user._id.toString(), role: user.role };

    const token = jwt.sign(userInfo, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    } as jwt.SignOptions);

    const userObj = user.toObject() as unknown as Record<string, unknown>;
    delete userObj.password;

    successResponse(res, userObj, "Login successful", StatusCodes.OK, token);
  } catch (error) {
    next(error);
  }
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.body;

  try {
    const createdUser = await User.create(user);

    const userObj = createdUser.toObject() as unknown as Record<
      string,
      unknown
    >;
    delete userObj.password;

    successResponse(
      res,
      userObj,
      "Registration successful",
      StatusCodes.CREATED,
    );
  } catch (error) {
    next(error);
  }
}

export async function checkUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user;
  try {
    if (!user) {
      throw new Error("User not found");
    }
    successResponse(res, user, "User is authenticated");
  } catch (error) {
    next(error);
  }
}
