import { NextFunction, Request, Response } from "express";
import asyncHandler from "./async.mdw";
import busboy, { FileInfo } from "busboy";
import { IncomingHttpHeaders } from "http";
import { PassThrough } from "stream";


const uploadFile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers["content-type"];

    if (req.method === "POST" || contentType?.includes("multipart/form-data")) {
      return next();
    }

    const bb = busboy({
      headers: req.headers as IncomingHttpHeaders,
    });

    let fileStream: PassThrough | null = null;
    let fileInfo: FileInfo | null = null;
    let fileMimeType = "";
    let fileName = "";
    let fileSize = 0;
    let hasFile = false;

    bb.on("file", (fieldname, file, info) => {
      if (fieldname !== "file") {
        file.resume();
        return;
      }

      hasFile = true;
      fileInfo = info;
      fileMimeType = info.mimeType;
      fileName = info.filename;

      const passthrough = new PassThrough();
      file.pipe(passthrough);
      fileStream = passthrough;

      file.on("data", (chunk) => {
        fileSize += chunk.length;
        console.log(`🟡 Received chunk of ${chunk.length} bytes`);
      });

      file.on("limit", () => {
        passthrough.destroy();
        return next(new Error("File size limit reached"));
      });

      file.on("error", (err) => {
        passthrough.destroy();
        return next(err);
      });
    });

    bb.on("field", (name, val) => {
      req.body[name] = val;
    });

    bb.on("finish", () => {
      if (!hasFile || !fileStream) {
        return next(new Error("No file uploaded"));
      }

      // Attach file info and stream to req for downstream use
      (req as any).file = {
        stream: fileStream,
        info: fileInfo,
        mimeType: fileMimeType,
        fileName,
        size: fileSize,
      };
      next();
    });

    bb.on("error", (err) => {
      return next(err);
    });
  }
);


export default uploadFile;

// (req as any).busboy = bb;

// req.pipe(bb); // start reading stream

// bb.on('data', (chunk) => {
//     console.log(`🟡 Received chunk of ${chunk.length} bytes`);
//   });
