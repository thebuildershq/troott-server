import express, { Request, Response, NextFunction } from "express";
import authRoutes from "./routers/auth.router";
import sermonRoutes from "./routers/sermon.router";



const  router = express.Router()

router.use('/auth', authRoutes)
router.use('/sermon', sermonRoutes)


router.get("/", (req: Request, res: Response, next: NextFunction) => {

    res.status(200).json({
        error: false,
        errors: [],
        data: {
            name: "TROOTT API",
            version: "1.0.0",

        },
        message: 'troott api v1.0.0 is healthy',
        status: 200
    })


})

export default router
