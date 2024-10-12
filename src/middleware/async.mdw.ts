import { Request, Response, NextFunction } from "express";

/**
 * Normal Promise will require that we use the async await that
 * leads to using try-cath blocks. This async handler helps to avoid repeating the blocks
 */
const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next)

export default asyncHandler