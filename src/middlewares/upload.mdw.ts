import { NextFunction, Request, Response } from "express";
import asyncHandler from "./async.mdw";
import busboy, { FileInfo } from "busboy";
import { IncomingHttpHeaders } from "http";

const uploadFile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (
      req.method === "POST" &&
      req.headers["content-type"]?.includes("multipart/form-data")
    ) {
      const bb = busboy({
        headers: req.headers as IncomingHttpHeaders,
      });

      let fileBuffer: Buffer[] = [];
      let fileInfo: FileInfo | null = null;
      let fileMimeType = "";
      let fileName = "";
      let fileSize = 0;
      let hasFile = false;

      bb.on("file", (fieldname, file, info) => {
        if (fieldname !== "file") {
          file.resume(); // ignore other files
          return;
        }

        hasFile = true;
        fileInfo = info;
        fileMimeType = info.mimeType;
        fileName = info.filename;

        file.on("data", (chunk) => {
          fileSize += chunk.length;
          console.log(`🟡 Received chunk of ${chunk.length} bytes`);
          fileBuffer.push(chunk);
        });

        file.on("limit", () => {
          return next(new Error("File size limit reached"));
        });

        file.on("error", (err) => {
          next(err);
        });
      });

      bb.on("field", (name, val) => {
        req.body[name] = val;
        console.log("📝 Busboy field:", name, val);
      });

      bb.on("finish", () => {
        if (!hasFile) {
          return next(new Error("No file uploaded"));
        }

        // Attach file info and buffer to req for downstream use
        (req as any).file = {
          buffer: Buffer.concat(fileBuffer),
          info: fileInfo,
          mimeType: fileMimeType,
          fileName,
          size: fileSize,
        };
        next();
      });

      req.pipe(bb);
    } else {
      next(); 
    }
  }
);

export default uploadFile;

// (req as any).busboy = bb;

// req.pipe(bb); // start reading stream

// bb.on('data', (chunk) => {
//     console.log(`🟡 Received chunk of ${chunk.length} bytes`);
//   });
