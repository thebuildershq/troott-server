import { Router } from "express";
import { publishSermon, uploadSermon } from "../../../controllers/sermon.controller";


const sermonRouter = Router({ mergeParams: true });

sermonRouter.post("/start-upload", uploadSermon);
sermonRouter.post("/finish-upload", uploadSermon);
sermonRouter.post("/publish", publishSermon);
sermonRouter.get("/public", uploadSermon);
sermonRouter.get("/category/:category", uploadSermon);

export default sermonRouter;
