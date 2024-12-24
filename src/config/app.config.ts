import { config } from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { ENVType } from "../utils/enums.util";
import ENV from "../utils/env.util";
import errorHandler from "../middleware/error.mdw";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import path from "path";
import expressSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import userAgent from "express-useragent";
import v1Routes from "../routes/v1/routers/routes.router";




config();


const app = express();

// body parser
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({limit: '50mb', extended: false}))

app.use(bodyParser.json({limit: '50mb', inflate: true}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}))

// cookie parser
app.use(cookieParser())

// temporaary files directory
app.use(fileUpload({useTempFiles: true, tempFileDir: path.join(__dirname, 'tmp')}))


/**
 * sanitize data
 * secure db against sql injection
 */
app.use(expressSanitize())

// secure response header
app.use(helmet())

// prevent parameter pollution
app.use(hpp())

// enable CORS: communicate with multiple domain
app.use(cors({origin: true, credentials: true}))

app.use ((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*"),
    res.header(
        "Access-Control-Allow-Origin", 
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    ),
    res.header(
        "Access-Control-Allow-Origin",
    "x-acess-token, origin, X-Requested-With, Content-Type, Accept"
    )
    next()

})

app.set('view engine', 'ejs')

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
            name: "GLOBITT API - DEFAULT",
            version: "1.0.0",

        },
        message: 'GLOBITT api v1.0.0',
        status: 200

    })


})

app.use('/v1', v1Routes)

app.use(errorHandler)

export default app;