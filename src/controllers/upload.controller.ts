import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middlewares/async.mdw";
import ErrorResponse from "../utils/error.util";
import uploadService from "../services/upload.service";

/**
 * @name uploadFile
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
  
      const session = await uploadService.handleUpload(file);
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