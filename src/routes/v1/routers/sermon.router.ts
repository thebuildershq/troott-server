import { Router } from "express";
import { UploadSermon } from "../../../controllers/sermon.controller";

const sermonRouter = Router({ mergeParams: true });

sermonRouter.post("/register", UploadSermon);


export default sermonRouter;
