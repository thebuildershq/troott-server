import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middlewares/async.mdw";
import ErrorResponse from "../utils/error.util";
import libraryRepository from "../repositories/library.repository";

/**
 * @name createLibrary
 * @description Create a new user library document
 * @route POST /api/v1/library
 * @access Private
 */
export const createLibrary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req.body;

    const library = await libraryRepository.createLibrary({ user });
    if (library.error) {
        return next(new ErrorResponse(library.message, library.code, []));
      }

    res.status(200).json({
      error: false,
      errors: [],
      message: "Library created successfully",
      status: 200,
      data: library,
    });
  }
);

/**
 * @name getLibraryByUser
 * @description Get a user's library document
 * @route GET /api/v1/library/:userId
 * @access Private
 */
export const getLibraryByUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const library = await libraryRepository.findByUser(userId);

    if (library.error) {
        return next(new ErrorResponse(library.message, library.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      message: "Library fetched successfully",
      status: 200,
      data: library,
    });
  }
);

/**
 * @name getAllLibraries
 * @description Get all user library documents (admin or internal use)
 * @route GET /api/v1/library
 * @access Private/Admin
 */
export const getAllLibraries = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const filters = {};
    const options = {
      limit,
      skip,
      sort: req.query.sort as string,
      populate: "likedSermons playlists favouritePreachers mostPlayed",
    };

    const result = await libraryRepository.findAll(filters, options);
    if (result.error) {
        return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      message: "All user libraries fetched successfully",
      status: 200,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result,
      },
    });
  }
);

/**
 * @name updateLibrary
 * @description Update fields in a user's library
 * @route PATCH /api/v1/library/:userId
 * @access Private
 */
export const updateLibrary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const updates = req.body;

    const library = await libraryRepository.updateLibrary(userId, updates);

    if (library.error) {
      return next(new ErrorResponse(library.message, library.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      message: "Library updated successfully",
      status: 200,
      data: library,
    });
  }
);

/**
 * @name deleteLibrary
 * @description Delete a user's library document
 * @route DELETE /api/v1/library/:userId
 * @access Private
 */
export const deleteLibrary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const deleted = await libraryRepository.deleteLibrary(userId);
    if (deleted.error) {
      return next(new ErrorResponse(deleted.message, deleted.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      message: "Library deleted successfully",
      status: 200,
      data: {},
    });
  }
);
