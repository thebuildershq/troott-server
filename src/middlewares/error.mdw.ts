import { Request, Response, NextFunction } from "express";
import ENV from "../utils/env.util";
import ErrorResponse from "../utils/error.util";
import logger from "../utils/logger.util";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let customError = {
    statusCode: 500,
    message: "Internal Server Error",
    errors: [] as string[],
    data: {},
  };

  // Uses your ErrorResponse class properly
  if (err instanceof ErrorResponse) {
    customError = {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors || [],
      data: err.data || {},
    };
  }

  // Handles Mongoose ValidationError
  else if (err.name === "ValidationError") {
    customError.statusCode = 400;
    customError.message = "Validation failed";
    customError.errors = Object.values(err.errors).map((item: any) =>
      item?.properties?.message || item.message || "Invalid input"
    );
  }

  // Handles Duplicate Key Error
  else if (err.code === 11000) {
    customError.statusCode = 400;
    customError.message = "Duplicate field value entered";
    customError.errors = [JSON.stringify(err.keyValue)];
  }

  // Handles CastError (invalid MongoDB IDs)
  else if (err.name === "CastError") {
    customError.statusCode = 400;
    customError.message = "Resource not found - invalid ID";
    customError.errors = [`Invalid ${err.path}: ${err.value}`];
  }

  // Logs only in dev or staging
  if (ENV.isDevelopment() || ENV.isStaging()) {
    logger.log({ data: err, label: 'ERR' });
  }

  res.status(customError.statusCode).json({
    error: true,
    message: customError.message,
    errors: customError.errors,
    data: customError.data,
    status: customError.statusCode,
  });
};

export default errorHandler;

// import { Request, Response, NextFunction } from "express";
// import ENV from "../utils/env.util";
// import ErrorResponse from "../utils/error.util";
// import logger from "../utils/logger.util";

// const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) =>{

//     let message: string = ''
//     let errors: Array<any> = []
//     let error = {...err}

//     if (err.errors) {
//         errors = Object.values(err.errors).map((item: any) => {

//             let result: any
//             if(item.properties){
//                 result = item.properties.message
//             } else {
//                 result = item
//             }
//             return result
//         })

//         if(ENV.isDevelopment() || ENV.isStaging()) {
//             logger.log({data: err, label: 'ERR'})
//         }

//         if (err.name === 'CastError') {
//             message = 'Resource not found - id cannot be casted'
//             error = new ErrorResponse(message, 500, errors)
//         }

//         if(err.code === 11000){
//             message = 'Duplicate field value entered'
//             error = new ErrorResponse (message, 500, errors)

//         }

//         if (err.name === 'Validation Error'){
//             message = 'An errror occured'
//             error = new ErrorResponse(message, 500, errors)
//         }
//     }

//     res.status(error.statusCode || 500).json({
//         error: true,
//         errors: error.errors ? error.errors: [],
//         data: {},
//         message: error.message ? error.message: 'Server Error',
//         status: error.statusCode ? error.statusCode : 500
//     })
// }

// export default errorHandler