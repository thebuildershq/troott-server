import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middleware/async.mdw";
import logger from "../utils/logger.utils";
import { RegisterDTO } from "../dtos/auth.dtos";


export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as RegisterDTO
    logger.log({label: 'BODY', data: body})

    res.status(200).json({
        error: false,
        errors: [],
        data: {},
        message: 'succesful',
        status: 200
    })
})