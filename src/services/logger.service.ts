import { Request, Response, NextFunction } from "express";
import pino from "pino";
import pinoHttp from "pino-http";
import { generateRandomChars } from "../utils/helper.util";

// Create a base logger with proper typing
export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  ...(process.env.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
});

// Middleware to capture response time
export const responseTimeTracker = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  res.on("finish", () => {
    const diff = process.hrtime(start);
    const time = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);
    res.setHeader("X-Response-Time", `${time}ms`);
  });
  next();
};

// Pino HTTP middleware with proper typing
export const requestLogger = pinoHttp({
  customProps: (req: Request, res: Response) => {
    const correlationId = generateRandomChars(24);
    res.locals.correlationId = correlationId;
    return { correlationId };
  },
  customLogLevel: (res, err) => {
    if ((res.statusCode ?? 200) >= 500 || err) return "error";
    if ((res.statusCode ?? 200) >= 400) return "warn";
    return "info";
  },
  logger,
  serializers: {
    req(req: Request) {
      return {
        method: req.method,
        url: req.url,
        query: req.query,
        ip: req.ip || req.socket.remoteAddress,
        correlationId: req.res?.locals?.correlationId,
        body: sanitizeData(req.body),
      };
    },
    res(res: Response) {
      return {
        statusCode: res.statusCode,
        responseTime: res.getHeader("X-Response-Time"),
      };
    },
  },
});

// Utility to mask sensitive fields
function sanitizeData(data: any) {
  if (!data || typeof data !== "object") return data;

  const sensitiveFields = ["password", "token", "ssn"];
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) =>
      sensitiveFields.includes(key) ? [key, "***"] : [key, value]
    )
  );
}
