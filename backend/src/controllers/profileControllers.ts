import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middlewares/errorHandler.js";
import { AuthResponse } from "../types/index.js";
import User from "../models/User.js";
import { sendSuccess } from "../utils/responseHelpers.js";
import Expense from "../models/Expense.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/uploadToCloudinary.js";

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const loggedInUser = user.toObject();

    const { password: _, ...userWithoutPassword } = loggedInUser;

    // const userResponse: AuthResponse = {
    //   user: { ...userWithoutPassword, _id: user._id.toString() },
    // };

    sendSuccess(res, userWithoutPassword, "Profile retrieved successfully");
  },
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        email: email,
        _id: { $ne: userId },
      });

      if (existingEmail) {
        return next(new AppError("Email already in use", 400));
      }
    }
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.password = password ?? user.password;

    await user.save({ validateBeforeSave: true });

    const loggedInUser = user.toObject();

    const { password: _, ...userWithoutPassword } = loggedInUser;

    const userResponse: AuthResponse = {
      user: { ...userWithoutPassword, _id: user._id.toString() },
    };

    sendSuccess(res, userResponse, "Profile updated successfully");
  },
);

export const uploadAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const file = req.file?.buffer;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (!file) {
      return next(new AppError("Please upload a file", 400));
    }
    if (user.public_id) {
      const { error: deleteError } = await deleteFromCloudinary(user.public_id);
      if (deleteError) {
        return next(new AppError(deleteError, 500));
      }
    }

    const { error, secure_url, public_id } = await uploadToCloudinary(file);

    if (error) {
      return next(new AppError(error, 500));
    }

    user.avatar = secure_url;
    user.public_id = public_id;

    await user.save();

    sendSuccess(res, { avatar: secure_url }, "Avatar uploaded successfully");
  },
);

export const getAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    sendSuccess(res, user.avatar ?? null, "Avatar retrieved successfully");
  },
);

export const deleteAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.public_id) {
      const { error: deleteError } = await deleteFromCloudinary(user.public_id);
      if (deleteError) {
        return next(new AppError(deleteError, 500));
      }
    }

    user.avatar = undefined;
    user.public_id = undefined;
    await user.save();
    sendSuccess(res, null, "Avatar deleted successfully");
  },
);

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.public_id) {
      const { error } = await deleteFromCloudinary(user.public_id);
      if (error) {
        return next(new AppError(error, 500));
      }
    }
    await Promise.all([
      await Expense.deleteMany({ userId }),
      await User.findByIdAndDelete(userId),
    ]);

    sendSuccess(res, null, "Account deleted successfully");
  },
);

export const exportData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const expenses = await Expense.find({ userId });

    const loggedInUser = user.toObject();

    const { password: _, ...userWithoutPassword } = loggedInUser;
    if (expenses.length === 0) {
      return sendSuccess(
        res,
        {
          user: { ...userWithoutPassword, _id: user._id.toString() },
          expenses: [],
          summary: {
            totalExpenses: 0,
            expensesCount: 0,
          },
          exportedAt: new Date().toISOString(),
        },
        "Data export successfully. You have no expenses",
      );
    }

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const exportDataObject = {
      user: { ...userWithoutPassword, _id: user._id.toString() },
      expenses,
      summary: {
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        expenseCount: expenses.length,
      },
      exportedAt: new Date().toISOString(),
    };

    sendSuccess(res, exportDataObject, "Data exported successfully.");
  },
);
