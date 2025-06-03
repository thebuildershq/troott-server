import { Request, NextFunction } from "express";
import { Model, Document, PopulateOptions } from "mongoose";
import { IcreatedAt, ICursorResponse } from "../utils/interface.util";

const cursorResults =
  <T extends Document & IcreatedAt>(
    model: Model<T>,
    populate?: string | PopulateOptions | (string | PopulateOptions)[]
  ) =>
  async (req: Request, res: ICursorResponse<T>, next: NextFunction) => {
    const { limit = "10", cursor } = req.query;
    const pageLimit = parseInt(limit as string, 10);

    let queryFilter: any = {};

    if (cursor) {
      queryFilter.createdAt = { $lt: new Date(cursor as string) };
    }

    let query = model
      .find(queryFilter)
      .sort({ createdAt: -1 }) // newest first
      .limit(pageLimit);

    if (populate) {
      if (typeof populate === "string") {
        query = query.populate(populate);
      } else {
        query = query.populate(populate);
      }
    }

    const results = await query;

    const nextCursor =
      results.length > 0
        ? results[results.length - 1].createdAt.toISOString()
        : null;
        
    res.customResults = {
      success: true,
      count: results.length,
      nextCursor,
      data: results,
    };

    next();
  };

export default cursorResults;
