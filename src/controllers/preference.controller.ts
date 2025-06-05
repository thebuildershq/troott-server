import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middlewares/async.mdw";
import { preferencesRepository } from "../repositories/preference.repository";
import ErrorResponse from "../utils/error.util";

/**
 * @name createPreferences
 * @description Create preferences (topics and preachers) for a user
 * @route POST /api/v1/preferences
 * @access Private
 */
export const createPreferences = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user, preferences } = req.body;

    const result = await preferencesRepository.createPreferences({
      user,
      preferences,
    });

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(201).json({
      error: false,
      errors: [],
      message: "Preferences created successfully",
      status: 201,
      data: result.data,
    });
  }
);

/**
 * @name getUserPreferences
 * @description Get preferences (topics and preachers) for a user
 * @route GET /api/v1/preferences/:userId
 * @access Private
 */
export const getUserPreferences = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const result = await preferencesRepository.findByUser(userId);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      message: "Preferences fetched successfully",
      status: 200,
      data: result.data,
    });
  }
);

/**
 * @name updatePreferences
 * @description Update a user's preferences (topics and/or preachers)
 * @route PATCH /api/v1/preferences/:userId
 * @access Private
 */
export const updatePreferences = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const updates = req.body;

    const result = await preferencesRepository.updatePreferences(
      userId,
      updates
    );

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      message: "Preferences updated successfully",
      status: 200,
      data: result.data,
    });
  }
);

/**
 * @name deletePreferences
 * @description Clear all preferences for a user
 * @route DELETE /api/v1/preferences/:userId
 * @access Private
 */
export const deletePreferences = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const result = await preferencesRepository.deletePreferences(userId);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      message: "Preferences deleted successfully",
      status: 200,
      data: result.data,
    });
  }
);

/**
 * @name getAllPreferences
 * @description Get preferences of all users (Admin only)
 * @route GET /api/v1/preferences
 * @access Private/Admin
 */
export const getAllPreferences = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await preferencesRepository.findAll();

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      message: "All user preferences fetched successfully",
      status: 200,
      data: result.data,
    });
  }
);
