import { config } from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { ENVType } from "../utils/enums.util";
import ENV from "../utils/env.util";


config();



const app = express();

app.get("/", (req: Request, res: Response, next: NextFunction) => {

    let enviornemnt = ENVType.DEVELOPMENT

    if (ENV.isProduction()) {
        enviornemnt = ENVType.PRODUCTION
    } else if (ENV.isStaging()) {
        enviornemnt = ENVType.STAGING
    } else if (ENV.isDevelopment()) {
        enviornemnt = ENVType.DEVELOPMENT
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: {
            name: "STREAMSQR API - DEFAULT",
            version: "1.0.0",

        },
        message: 'StreamSqr api v1.0.0',
        status: 200

    })


})

export default app;