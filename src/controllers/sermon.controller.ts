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
import { EContentState, EContentStatus } from "../utils/enums.util";

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
      state: state || EContentState.DELETED,
      status: status || EContentStatus.DELETED,
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
      return next(new ErrorResponse(result.message, result.code || 500, []));
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
      populate: "preacher series category",
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
      populate: "preacher series category",
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
