import { NextFunction, Request, Response } from "express";
import asyncHandler from "./async.mdw";
import busboy, { FileInfo } from "busboy";
import { IncomingHttpHeaders } from "http";
import { PassThrough } from "stream";
import { v4 as uuidv4 } from "uuid";
import redisMdw from "./redis.mdw";
import ErrorResponse from "../utils/error.util";
import { IUploadFile } from "../utils/interface.util";



const acceptedMimeType = [
  "image/jpeg", "image/png", "image/webp", "image/svg",
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/aac",
  "audio/x-m4a", "video/mp4", "video/webm",
];

const expectedSize = 100 * 1024 * 1024;

/**
 * @description Middleware to handle file uploads using busboy
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const uploadFile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers["content-type"];

    const method = req.method.toUpperCase();

    if (
      !["POST", "PUT", "PATCH"].includes(method) ||
      !contentType?.includes("multipart/form-data")
    ) {
      return next();
    }

    const stream = busboy({
      headers: req.headers as IncomingHttpHeaders,
      limits: {
        files: 10,
        fileSize: expectedSize,
      },
    });

    const files: IUploadFile[] = [];
    req.body = {};
    let uploadId = req.headers["x-upload-id"] || uuidv4();

    stream.on("file", (fieldname, file, info) => {

      const { filename, mimeType } = info;

      if (!acceptedMimeType.includes(mimeType) || filename.endsWith(".exe")) {
      file.resume();
      return next(new ErrorResponse(`File "${filename}" is not supported.`, 400, []));
    }

      const uploadStream = new PassThrough();
      const metadataStream = new PassThrough();
      let fileSize = 0;

      const fileName = info.filename;

      file.on("data", async (chunk) => {
        uploadStream.write(chunk);
        metadataStream.write(chunk);
        fileSize += chunk.length;

        const percent = ((fileSize / expectedSize) * 100).toFixed(2);
        console.log(`Upload progress for ${fileName}: ${percent}%`);

        await redisMdw.keepData({
          key: `upload-progress:${uploadId}:${filename}`,
          value: { percent, fileSize },
        }, 900); 
      });
        
    
      file.on("end", () => {
        uploadStream.end();
        metadataStream.end();

        files.push({
          fieldname,
          stream: uploadStream,
          metadataStream: metadataStream,
          fileName: info.filename,
          mimeType: info.mimeType,
          info,
          size: fileSize,
        });

        console.log(`🟢 Finished streaming file: ${fileName}, size: ${fileSize} bytes`);
      });

      file.on("error", (err) => {
        uploadStream.destroy(err);
        metadataStream.destroy(err);
        return next(err);
      });

      uploadStream.on("error", (err) => {
        metadataStream.destroy(err);
        return next(err);
      });

      metadataStream.on("error", (err) => {
        uploadStream.destroy(err);
        return next(err);
      });
    });

    stream.on("field", (name, value) => {
      req.body[name] = value;
    });

    stream.on("finish", () => {
      if (!files.length) {
        return next(new Error("No file uploaded"));
      }

      (req as any).files = files;
      next();
    });

    stream.on("error", (err) => {
      next(err);
    });

    req.pipe(stream);
  }
);

export default uploadFile;
