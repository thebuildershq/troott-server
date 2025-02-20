import { Request, Response, NextFunction } from "express";
import Logger from "../utils/logger.util"; 
import colors from "colors";
import { generateRandomChars } from "../utils/helper.util";


/**
 * @name requestLogger
 * @description Middleware to log all incoming requests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const correlationId = generateRandomChars(24);
  req.headers["x-correlation-id"] = correlationId;

  if (!req.method || !req.url) {
    Logger.log({
      label: colors.cyan.bold("Malformed Request"),
      data: `${correlationId}, Request is missing method or URL`,
      type: "error",
    });
    return next();
  }

  Logger.log({
    label: colors.blue.bold("Incoming Request"),
    data: { correlationId, method: req.method, url: req.url },
    type: "info",
  });

  const sanitizeData = (data: any) => {
    const sensitiveFields = ["password", "token", "ssn"];
    if (typeof data === "object" && data !== null) {
      for (const field of sensitiveFields) {
        if (data[field]) data[field] = "***";
      }
    }
    return data;
  };

  if (req.body) {
    Logger.log({
      label: colors.blue.bold("Sanitized Request Data"),
      data: sanitizeData(req.body),
      type: "info",
    });
  }

  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    Logger.log({
      label: colors.blue.bold("Request Completed"),
      data: `
      ${correlationId}, 
      Method: ${req.method}, 
      URL: ${req.url}, 
      Status: ${res.statusCode}, 
      Duration: ${duration}ms`,
      type:
        res.statusCode >= 500
          ? "error"
          : res.statusCode >= 400
          ? "warning"
          : "success",
    });

    const sanitizeData = (data: any) => {
        if (typeof data === "object" && data.password) {
          data.password = "***"; 
        }
        return data;
      };

      Logger.log({ 
        label: "Request Data", 
        data: sanitizeData(req.body), 
        type: "info" 
    });
      
  });

  next();
};
