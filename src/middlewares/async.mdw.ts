import { Request, Response, NextFunction } from "express";

/**
 * @description Higher-order function that wraps async operations.
 * Normal Promise will require that we use the async await that
 * leads to using try-cath blocks. This async handler helps to avoid repeating the blocks.
 * Supports both Express middleware and regular async functions.
 * @param {Function} fn - Function to wrap
 * @returns {Function} Wrapped function that handles promises
 *
 */
const asyncHandler = (fn: any) => {
  return function (...args: any[]) {
    const isExpressMiddleware =
      args.length === 3 &&
      args[0]?.constructor?.name === "IncomingMessage" &&
      args[1]?.constructor?.name === "ServerResponse";

    if (isExpressMiddleware) {
      const [req, res, next] = args as [Request, Response, NextFunction];
      return Promise.resolve(fn(req, res, next)).catch((error: Error) => {
        error.stack = error.stack || new Error().stack;
        next(error);
      });
    }

    // Handle non-Express async functions
    return Promise.resolve(fn(...args)).catch((error) => {
      error.stack = error.stack || new Error().stack;
      throw error;
    });
  };
};
export default asyncHandler;
