import { NextFunction, Request, Response } from "express";
import asyncHandler from "./async.mdw";
import busboy, { FileInfo } from "busboy";
import { IncomingHttpHeaders } from "http";
import { PassThrough } from "stream";

const uploadFile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers["content-type"];
    if (
      req.method !== "POST" ||
      !contentType?.includes("multipart/form-data")
    ) {
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

    bb.on("file", (fieldname, file, info) => {
      if (fieldname !== "file") {
        file.resume();
        return;
      }

      hasFile = true;
      fileInfo = info;
      mimeType = info.mimeType;
      fileName = info.filename;

      // Two independent PassThrough streams
      const uploadStream = new PassThrough();
      const metadataStream = new PassThrough();

      // Track file size from upload stream
      uploadStream.on("data", (chunk) => {
        fileSize += chunk.length;
        console.log(`🟡 Chunk received: ${chunk.length} bytes`);
      });

      uploadStream.on("error", (err) => {
        metadataStream.destroy(err);
        return next(err);
      });

      metadataStream.on("error", (err) => {
        uploadStream.destroy(err);
        return next(err);
      });

      // Pipe the file into both streams (fan-out)
      file.on("data", (chunk) => {
        uploadStream.write(chunk);
        metadataStream.write(chunk);
      });

      file.on("end", () => {
        uploadStream.end();
        metadataStream.end();
        console.log("🟢 File stream ended");
      });

      file.on("error", (err) => {
        uploadStream.destroy(err);
        metadataStream.destroy(err);
        return next(err);
      });

      // Attach to request
      (req as any).file = {
        stream: uploadStream,
        streamForMetadata: metadataStream,
        fileName,
        mimeType,
        info: fileInfo,
        size: fileSize,
      };
    });

    bb.on("field", (name, val) => {
      req.body[name] = val;
    });

    bb.on("finish", () => {
      if (!hasFile) {
        return next(new Error("No file uploaded"));
      }
      next();
    });

    bb.on("error", (err) => {
      next(err);
    });

    req.pipe(bb);
  }
);

export default uploadFile;
