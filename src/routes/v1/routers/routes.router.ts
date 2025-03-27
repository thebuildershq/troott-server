import express, { Request, Response, NextFunction } from "express";


const  router = express.Router()

//router.use('/auth', authRoutes)


router.get("/", (req: Request, res: Response, next: NextFunction) => {

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

export default router
