import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middlewares/async.mdw";
import uploadService from "../services/upload.service";
import ErrorResponse from "../utils/error.util";
import { IUserDoc } from "../utils/interface.util";
import { ContentType } from "../utils/enums.util";

// upload sermon
export const UploadSermon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) {
      return next(new ErrorResponse("No file uploaded", 400, []));
    }

    const type = req.body.type || ContentType.SERMON;
    const user = req.user as IUserDoc;

    const session = await uploadService.initiateUpload(file, type, user);
    if (!session) {
      return next(new ErrorResponse("Failed to initiate upload", 500, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: session,
      message: "upload started",
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
