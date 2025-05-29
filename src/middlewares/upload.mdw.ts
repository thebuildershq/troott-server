import { NextFunction, Request, Response } from "express";
import asyncHandler from "./async.mdw";
import busboy, { FileInfo } from "busboy";
import { IncomingHttpHeaders } from "http";
import { PassThrough } from "stream";
import { once } from "events";


const uploadFile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers["content-type"];

    // Validate the request method and content-type
    if (req.method === "POST" || !contentType?.includes("multipart/form-data")) {
      return next();
    }

    const bb = busboy({
      headers: req.headers as IncomingHttpHeaders,
    });

    let hasFile = false;
    let mimeType = "";
    let fileName = "";
    let fileSize = 0;
    let fileInfo: FileInfo | null = null;

    const metadataStream = new PassThrough();
    const uploadStream = new PassThrough();

    bb.on("file", (fieldname, file, info) => {
      if (fieldname !== "file") {
        file.resume();
        return;
      }

      hasFile = true;
      fileInfo = info;
      mimeType = info.mimeType;
      fileName = info.filename;

      // Pipe the incoming stream into two PassThroughs
      file.pipe(metadataStream);
      file.pipe(uploadStream);

      file.on("data", (chunk) => {
        fileSize += chunk.length;
        console.log(`🟡 Received chunk of ${chunk.length} bytes`);
      });

      file.on("limit", () => {
        metadataStream.destroy();
        uploadStream.destroy();
        return next(new Error("File size limit reached"));
      });

      file.on("error", (err) => {
        metadataStream.destroy(err);
        uploadStream.destroy(err);
        return next(err);
      });
    });

    bb.on("field", (name, val) => {
      req.body[name] = val;
    });

    bb.on("finish", () => {
      if (!hasFile) {
        return next(new Error("No file uploaded"));
      }

      // Attach file info and stream to req for downstream use
      (req as any).file = {
        stream: uploadStream,
        streamForMetadata: metadataStream,
        fileName,
        mimeType,
        info: fileInfo,  
        size: fileSize,
      };
      next();
    });

    bb.on("error", (err) => {
        if (err instanceof Error) {
            metadataStream.destroy(err);
            uploadStream.destroy(err);
            return next(err);
          }

        const error = new Error("Unknown upload error");
        
        metadataStream.destroy(error);
        uploadStream.destroy(error);
        next(error);
    });

    req.pipe(bb);

    await once(bb, "finish");
  }
);


export default uploadFile;

// (req as any).busboy = bb;

// req.pipe(bb); // start reading stream

// bb.on('data', (chunk) => {
//     console.log(`🟡 Received chunk of ${chunk.length} bytes`);
//   });
