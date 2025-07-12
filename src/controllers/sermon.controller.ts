import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middlewares/async.mdw";
import UploadService from "../services/upload.service";
import ErrorResponse from "../utils/error.util";
import sermonRepository from "../repositories/sermon.repository";
import {
  DeleteSermonDTO,
  PublishSermonDTO,
  UpdateSermonDTO,
} from "../dtos/sermon.dto";
import { ISermonDoc } from "../utils/interface.util";
import { ContentState, ContentStatus } from "../utils/enums.util";

/**
 * @name uploadFile
 * @description A method to handle sermon file uploads.
 * Processes the multipart form data, validates the upload,
 * and initiates the upload session.
 * @route POST /api/v1/sermon/start-upload
 * @access Public
 * @param {File} file
 * @returns {Object} uplaod sermon details
 */
export const uploadSermon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = (req as any).file;
    if (!file) {
      return next(new ErrorResponse("No file found in request", 400, []));
    }

    const session = await UploadService.handleUpload(file);
    if (!session) {
      return next(new ErrorResponse("Failed to initiate upload", 500, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: session,
      message: "upload successful",
      status: 200,
    });
  }
);

/**
 * @name publishSermon
 * @description A method to publish a processed sermon.
 * Makes the sermon publicly accessible and updates its status.
 * @route POST /api/v1/sermon/publish
 * @access Public
 * @returns {Object} publlished sermon
 */
export const publishSermon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      uploadId,
      title,
      description,
      duration,
      releaseDate,
      releaseYear,
      sermonUrl,
      imageUrl,
      topic,
      tags,
      isPublic,
      isSeries,
      preacherId,
      uploadedBy,
    }: PublishSermonDTO = req.body;

    const uploadExit = await sermonRepository.findByUploadId(
      uploadId as string
    );
    if (uploadExit.error) {
      return next(new ErrorResponse(uploadExit.message, uploadExit.code!, []));
    }

    const session = await UploadService.handleSermonPublish({
      title,
      description,
      duration,
      releaseDate,
      releaseYear,
      sermonUrl,
      imageUrl,
      topic,
      tags,
      isPublic,
      isSeries,
      preacherId,
      uploadedBy,
    });
    if (!session) {
      return next(new ErrorResponse("Failed to initiate publish", 500, []));
    }

    //await delete upload

    res.status(200).json({
      error: false,
      errors: [],
      data: session,
      message: "sermon published succesfully",
      status: 200,
    });
  }
);

/**
 * @name updateSermon
 * @description A method to update an existing sermon by ID.
 * @route PUT /api/v1/sermon/update/:id
 * @access Public
 * @returns {Object} updated sermon
 */
export const updateSermon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const sermonExist = await sermonRepository.findBySermonId(id);
    if (sermonExist.error) {
      return next(
        new ErrorResponse(sermonExist.message, sermonExist.code!, [])
      );
    }

    const {
      title,
      description,
      duration,
      releaseDate,
      releaseYear,
      sermonUrl,
      imageUrl,
      size,
      topic,
      tags,
      isPublic,
      shareableUrl,
      isSeries,
      series,
      state,
      status,
      preacher,
      playlist,
      publishedBy,
      versionId,
      changesSummary,
      uploadRef,
      uploadSummary,
    } = req.body;

    const updatePayload: Partial<UpdateSermonDTO> = {
      title,
      description,
      duration,
      releaseDate,
      releaseYear,
      sermonUrl,
      imageUrl,
      size,
      topic,
      tags,
      isPublic,
      shareableUrl,
      isSeries,
      series,
      state,
      status,
      preacher,
      playlist,
      publishedBy,
      versionId,
      changesSummary,
      uploadRef,
      uploadSummary,
    };

    const updated = await sermonRepository.updateSermon(
      id,
      updatePayload as Partial<ISermonDoc>
    );

    if (updated.error) {
      return next(new ErrorResponse(updated.message, updated.code!, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: updated.data,
      message: "Sermon updated successfully",
      status: 200,
    });
  }
);

/**
 * @name moveSermonToBin
 * @description Soft deletes a sermon by marking its status as DELETED.
 * This does not remove the sermon from the database, but makes it invisible in active listings
 * @route PUT /api/v1/sermon/move-to-bin/:id
 * @access Public
 * @returns {Object} updated sermon
 */
export const moveSermonToBin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { state, status, publishedBy }: Partial<DeleteSermonDTO> = req.body;

    const sermonExist = await sermonRepository.findBySermonId(id);
    if (sermonExist.error) {
      return next(
        new ErrorResponse(sermonExist.message, sermonExist.code!, [])
      );
    }

    const deletePayload = {
      state: state || ContentState.DELETED,
      status: status || ContentStatus.DELETED,
      publishedBy: publishedBy,
    };

    const deleted = await sermonRepository.moveSermonToBin(id, deletePayload);
    if (deleted.error) {
      return next(new ErrorResponse(deleted.message, deleted.code!, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: deleted.data,
      message: "Sermon moved to bin successfully",
      status: 200,
    });
  }
);

/**
 * @name deleteSermon
 * @description deletes a sermon from the database.
 * @route DELETE /api/v1/sermon/deleete/:id
 * @access Public
 * @returns {Object} updated sermon
 */
export const deleteSermon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const sermonExist = await sermonRepository.findBySermonId(id);
    if (sermonExist.error) {
      return next(
        new ErrorResponse(sermonExist.message, sermonExist.code!, [])
      );
    }

    const deleted = await sermonRepository.deleteSermon(id);
    if (deleted.error) {
      return next(new ErrorResponse(deleted.message, deleted.code!, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: deleted.data,
      message: "Sermon deleted successfully",
      status: 200,
    });
  }
);

/**
 * @name getSermonById
 * @description Get a sermon and its metadata by ID
 * @route GET /api/v1/sermon/:id
 * @access Public
 */
export const getSermonById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const sermon = await sermonRepository.findBySermonId(id);
    if (sermon.error)
      return next(new ErrorResponse(sermon.message, sermon.code!, []));

    res.status(200).json({
      error: false,
      errors: [],
      data: sermon.data,
      message: "Sermon fetched successfully",
      status: 200,
    });
  }
);

/**
 * @name getSermonsBytopic
 * @description Get sermons filtered by topic
 * @route GET /api/v1/sermon/topic/:topic
 * @access Public
 * @returns {Object} list of sermons
 */
export const getSermonsByTopic = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { topic } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = {
      limit,
      skip,
      sort: req.query.sort as string,
      populate: "preacher series topic",
    };

    const result = await sermonRepository.findByTopic(topic, options);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: `Sermons for topic "${topic}" retrieved successfully`,
      status: 200,
    });
  }
);

/**
 * @name getAllSermons
 * @description Get all sermons with pagination, filtering, sorting
 * @route GET /api/v1/sermon
 * @access Public
 * @returns {Object} list of sermons
 */
export const getAllSermons = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const filters = {};
    const options = {
      limit,
      skip,
      sort: req.query.sort as string,
      populate: "preacher series topic",
    };

    const result = await sermonRepository.findAll(filters, options);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 500, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: "Sermons retrieved successfully",
      status: 200,
    });
  }
);

/**
 * @name getSermonsByPreacher
 * @description Get sermons by preacher
 * @route GET /api/v1/sermon/preacher/:preacherId
 * @access Public
 * @returns {Object} list of sermons
 */
export const getSermonsByPreacher = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { preacherId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = {
      limit,
      skip,
      sort: req.query.sort as string,
      populate: "preacher series topic",
    };

    const result = await sermonRepository.getSermonsByPreacher(
      preacherId,
      options
    );

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 500, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: `Sermons by preacher retrieved successfully`,
      status: 200,
    });
  }
);

/**
 * @name getSermonsByPreacherSorted
 * @description Internal helper to fetch sermons by preacher with dynamic sort field.
 * Helper to get sermons by preacher sorted by various criteria
 * @param {"playCount" | "likeCount" | "shareCount" | "releaseDate"} sortField
 * @returns {Function} Express handler function
 */
const getSermonsByPreacherSorted = (
  sortField: "playCount" | "likeCount" | "shareCount" | "releaseDate"
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { preacherId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = {
      limit,
      skip,
      populate: "preacher series topic",
      recentOnly: sortField === "releaseDate", // for recent filter
    };

    const result = await sermonRepository.findByPreacherSorted(
      preacherId,
      sortField,
      options
    );

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 500, []));
    }

    const messagesMap: Record<string, string> = {
      playCount: "Most played sermons retrieved successfully",
      likeCount: "Most liked sermons retrieved successfully",
      shareCount: "Most shared sermons retrieved successfully",
      releaseDate: "Recently published sermons retrieved successfully",
    };

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: messagesMap[sortField],
      status: 200,
    });
  });

/**
 * @name getSermonsByPreacherMostPlayed
 * @description Get most played sermons by preacher
 * @route GET /api/v1/sermon/preacher/:preacherId/most-played
 * @access Public
 * @returns {Object} list of sermons sorted by most played
 */
export const getSermonsByPreacherMostPlayed =
  getSermonsByPreacherSorted("playCount");

/**
 * @name getSermonsByPreacherMostLiked
 * @description Get most liked sermons by preacher
 * @route GET /api/v1/sermon/preacher/:preacherId/most-liked
 * @access Public
 * @returns {Object} list of sermons sorted by most liked
 */
export const getSermonsByPreacherMostLiked =
  getSermonsByPreacherSorted("likeCount");

/**
 * @name getSermonsByPreacherMostShared
 * @description Get most shared sermons by preacher
 * @route GET /api/v1/sermon/preacher/:preacherId/most-shared
 * @access Public
 * @returns {Object} list of sermons sorted by most shared
 */
export const getSermonsByPreacherMostShared =
  getSermonsByPreacherSorted("shareCount");

/**
 * @name getSermonsByPreacherRecentlyPublished
 * @description Get recently published sermons by preacher (within the last 7 days)
 * @route GET /api/v1/sermon/preacher/:preacherId/recently-published
 * @access Public
 * @returns {Object} list of recently published sermons
 */
export const getSermonsByPreacherRecentlyPublished =
  getSermonsByPreacherSorted("releaseDate");

/**
 * @name getSermonsAllSorted
 * @description Internal helper to fetch sermons across all preachers with dynamic sort field
 * @param {"playCount" | "likeCount" | "shareCount" | "releaseDate"} sortField
 * @returns {Function} Express route handler function
 */
const getSermonsAllSorted = (
  sortField: "playCount" | "likeCount" | "shareCount" | "releaseDate"
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = {
      limit,
      skip,
      populate: "preacher series topic",
      recentOnly: sortField === "releaseDate",
    };

    const result = await sermonRepository.findAllSorted(sortField, options);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 500, []));
    }

    const messagesMap: Record<string, string> = {
      playCount: "Most played sermons retrieved successfully",
      likeCount: "Most liked sermons retrieved successfully",
      shareCount: "Most shared sermons retrieved successfully",
      releaseDate: "Recently published sermons retrieved successfully",
    };

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: messagesMap[sortField],
      status: 200,
    });
  });

/**
 * @name getSermonsMostPlayed
 * @description Get most played sermons across all preachers
 * @route GET /api/v1/sermon/most-played
 * @access Public
 * @returns {Object} List of most played sermons
 */
export const getSermonsMostPlayed = getSermonsAllSorted("playCount");

/**
 * @name getSermonsMostLiked
 * @description Get most liked sermons across all preachers
 * @route GET /api/v1/sermon/most-liked
 * @access Public
 * @returns {Object} List of most liked sermons
 */
export const getSermonsMostLiked = getSermonsAllSorted("likeCount");

/**
 * @name getSermonsMostShared
 * @description Get most shared sermons across all preachers
 * @route GET /api/v1/sermon/most-shared
 * @access Public
 * @returns {Object} List of most shared sermons
 */
export const getSermonsMostShared = getSermonsAllSorted("shareCount");

/**
 * @name getSermonsRecentlyPublished
 * @description Get recently published sermons across all preachers (last 7 days)
 * @route GET /api/v1/sermon/recently-published
 * @access Public
 * @returns {Object} List of recent sermons
 */
export const getSermonsRecentlyPublished = getSermonsAllSorted("releaseDate");

/**
 * @name getRecentlyAddedSermons
 * @description Get sermons released in the last 30 days
 * @returns {Function} Express route handler function
 */
export const getRecentlyAddedSermons = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = { limit, skip, populate: "preacher series category" };
    const result = await sermonRepository.findRecentlyAddedMonthly(options);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: "Recently added sermons retrieved successfully",
      status: 200,
    });
  }
);

/**
 * @name getUserRecentlyPlayedSermons
 * @description Get sermons the user recently played
 * @returns {Function} Express route handler function
 */
export const getUserRecentlyPlayedSermons = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const userId = req.user?._id;
    if (!userId) return next(new ErrorResponse("Unauthorized", 401, []));

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = { limit, skip, populate: "preacher series category" };
    const result = await sermonRepository.findRecentlyPlayedByUser(
      userId,
      options
    );

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: "Recently played sermons retrieved successfully",
      status: 200,
    });
  }
);

/**
 * @name getPopularSermonsRecentlyPlayed
 * @description Get sermons most recently played by users across the app
 * @returns {Function} Express route handler function
 */
export const getPopularSermonsRecentlyPlayed = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = { limit, skip, populate: "preacher series topic" };
    const result = await sermonRepository.findMostRecentlyPlayed(options);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: "Popular sermons retrieved successfully",
      status: 200,
    });
  }
);

/**
 * @name getFavoritePreacherSermons
 * @description Get a random list of sermons from a user's favorite preachers
 * @returns {Function} Express route handler function
 */
export const getFavoritePreacherSermons = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const favoritePreacherIds = req.user?.favoritePreachers || [];
    if (
      !Array.isArray(favoritePreacherIds) ||
      favoritePreacherIds.length === 0
    ) {
      return next(new ErrorResponse("No favorite preachers found", 400, []));
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = { limit, skip, populate: "preacher series topic" };
    const result = await sermonRepository.findFavoritePreachersSermonsRandom(
      favoritePreacherIds,
      options
    );

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: "Sermons from favorite preachers retrieved successfully",
      status: 200,
    });
  }
);

/**
 * @name getSermonsByUserInterests
 * @description Get sermons based on user interest tags or topics
 * @returns {Function} Express route handler function
 */
export const getSermonsByUserInterests = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const interests = req.user?.interests || [];
    if (!Array.isArray(interests) || interests.length === 0) {
      return next(new ErrorResponse("No interests provided", 400, []));
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = { limit, skip, populate: "preacher series topic" };
    const result = await sermonRepository.findByUserInterests(
      interests,
      options
    );

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: "Sermons based on interests retrieved successfully",
      status: 200,
    });
  }
);

// create sermon metadata
// get sermon metadata
// update sermon metadata
// delete sermon metadata
// publish sermon
// edit sermon
// delete sermon

// get all sermon list
// get a sermon + metadata
// get sermon by topic
// get sermon by preacher
// get sermon by preacher: most played
// get sermon by preacher: most liked
// get sermon by preacher: most shared
// get sermon by preacher: recently published (new release)

// get sermon list by series
// get sermon list by date
// get sermon list by search
// get sermon list by topic
// get most played sermon list
// get most liked sermon list
// get most shared sermon list

// share a sermon

// get catalog for new user
// get trending sermons (week)
// get popuar sermons (quarterly)
// get new release (weekly)
// get recently added (monthly)
// get most recently played (by users) - popular/recommended
// get favourite preachers sermons (randomly) - the lsit
// get sermon based on user interests

// get catalog for returning user
// get trending sermons
// get new release (weekly)
// get recently added (monthly)
// get recently played (by user)
// get most recently played (by users) - popular/recommended
// get favourite preachers sermons (randomly) - the lsit
// get sermon based on user interests

// Recommendations
// get user's listening history (completed, skipped, liked, disliked).
// get user’s interactions (comments, shares, saves).
// get user’s following list (creators, preachers).
