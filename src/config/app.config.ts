import  dotenv, { config } from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { EENVType } from "../utils/enums.util";
import ENV from "../utils/env.util";
import errorHandler from "../middlewares/error.mdw";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import expressSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import v1Routes from "../routes/v1/routes.router"
import uploadFile from "../middlewares/upload.mdw";





config();
dotenv.config();

const app = express();

// body parser
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({limit: '50mb', extended: false}))

app.use(bodyParser.json({limit: '50mb', inflate: true}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}))

// cookie parser
app.use(cookieParser())

// request logger
// app.use(responseTimeTracker)
// app.use(requestLogger)

// temporaary files directory
//app.use(fileUpload({useTempFiles: true, tempFileDir: path.join(__dirname, 'tmp')}))

app.use(uploadFile);  
  
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

    let enviornemnt = EENVType.DEVELOPMENT

    if (ENV.isProduction()) {
        enviornemnt = EENVType.PRODUCTION
    } else if (ENV.isStaging()) {
        enviornemnt = EENVType.STAGING
    } else if (ENV.isDevelopment()) {
        enviornemnt = EENVType.DEVELOPMENT
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: {
            name: "troott API",
            version: "1.0.0",

        },
        message: 'trott api v1.0.0 is running',
        status: 200

    })


})

app.use('/v1', v1Routes)

app.use(errorHandler)

export default app;