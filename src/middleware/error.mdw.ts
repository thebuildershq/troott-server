import { Request, Response, NextFunction } from "express";
import ENV from "../utils/env.util";
import ErrorResponse from "../utils/error.util";
import logger from "../utils/logger.util";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) =>{

    let message: string = ''
    let errors: Array<any> = []
    let error = {...err}

    if (err.errors) {
        errors = Object.values(err.errors).map((item: any) => {

            let result: any
            if(item.properties){
                result = item.properties.message
            } else {
                result = item
            }
            return result
        })

        if(ENV.isDevelopment() || ENV.isStaging()) {
            logger.log({data: err, label: 'ERR'})
        }

        if (err.name === 'CastError') {
            message = 'Resource not found - id cannot be casted'
            error = new ErrorResponse(message, 500, errors)
        }

        if(err.code === 11000){
            message = 'Duplicate field value entered'
            error = new ErrorResponse (message, 500, errors)

        }

        if (err.code === 'Validation Error'){
            message = 'An errror occured'
            error = new ErrorResponse(message, 500, errors)
        }
    }

    res.status(error.statusCode || 500).json({
        error: true,
        errors: error.errors ? error.errors: [],
        data: {},
        message: error.message ? error.message: 'Server Error',
        status: error.statusCode ? error.statusCode : 500
    })
}

export default errorHandler