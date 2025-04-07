import { Request, Response, NextFunction } from "express";

/**
 * 
 */
/**
 * @description Higher-order function that wraps Express route handlers to handle async operations.
 * Normal Promise will require that we use the async await that
 * leads to using try-cath blocks. This async handler helps to avoid repeating the blocks
 * @param {Function} fn - Express route handler function to wrap
 * @returns {Function} Wrapped Express middleware function
 * @example
 * ```typescript
 * const routeHandler = asyncHandler(async (req, res, next) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * });
 * ```
 * @throws {Error} Forwards any errors to Express error handling middleware
 */
const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next)

export default asyncHandler