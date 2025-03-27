import { rateLimit } from "express-rate-limit";

export const limitRequests = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 1000,
    legacyHeaders: true,
    standardHeaders: "draft-7",
    message: "you have exceeeded the number of requests. try again in 30 minutes",
    statusCode: 403
})