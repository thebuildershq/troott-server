import { Router } from "express";
import {
    deleteSermon,
    moveSermonToBin,
  publishSermon,
  updateSermon,
  uploadSermon,
} from "../../../controllers/sermon.controller";

const sermonRouter = Router({ mergeParams: true });

sermonRouter.post("/start-upload", uploadSermon);
sermonRouter.post("/publish", publishSermon);
sermonRouter.put("/update/:id", updateSermon);
sermonRouter.put("/move-to-bin/:id", moveSermonToBin);
sermonRouter.delete("/delete/:id", deleteSermon);

export default sermonRouter;
