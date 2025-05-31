import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middlewares/async.mdw";
import SermonService from "../services/sermon.service";
import ErrorResponse from "../utils/error.util";
import sermonRepository from "../repositories/sermon.repository";
import { PublishSermonDTO } from "../dtos/sermon.dto";


/**
 * @name uploadSermon
 * @description A method to handle sermon file uploads.
 * Processes the multipart form data, validates the upload,
 * and initiates the upload session.
 * @route POST /api/v1/sermon/upload
 * @access Public
 * @param {File} file
 * @returns {Object} a uplaod sermon details
 */
export const uploadSermon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = (req as any).file;
    if (!file) {
      return next(new ErrorResponse("No file found in request", 400, []));
    }

    const session = await SermonService.handleUpload(file);
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
      category,
      tags,
      isPublic,
      isSeries,
      preacherId,
      uploadedBy,
    }: PublishSermonDTO = req.body;

    const uploadExit = await sermonRepository.findByUploadId(uploadId as string);
    if (uploadExit.error) {
      return next(new ErrorResponse(uploadExit.message, uploadExit.code!, []));
    }


    const session = await SermonService.handlePublish({
      title,
      description,
      duration,
      releaseDate,
      releaseYear,
      sermonUrl,
      imageUrl,
      category,
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

// create sermon metadata
// get sermon metadata
// update sermon metadata
// delete sermon metadata
// publish sermon
// edit sermon
// delete sermon
// get all sermon list
// get a sermon + metadata
// share a sermon

// like a sermon
// add to default library playlit
// add to count

// unlike a sermon
// remove to default library playlit
// remove to count
