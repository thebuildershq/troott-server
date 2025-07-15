import express, { Request, Response, NextFunction } from "express";
import authRoutes from "./routers/auth.router";
import sermonRoutes from "./routers/sermon.router";
import libraryRoutes from "./routers/library.router";
import playlistRoutes from "./routers/playlist.router";
import preferenceRoutes from "./routers/preference.router";
import userRoutes from "./routers/user.router";
import webhookRoutes from "./routers/webhook.router";

const router = express.Router();

router.use("/webhook", webhookRoutes);
router.use("/auth", authRoutes);
router.use("/library", libraryRoutes);
router.use("/playlist", playlistRoutes);
router.use("/sermon", sermonRoutes);
router.use("/preference", preferenceRoutes);
router.use("/user", userRoutes);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    error: false,
    errors: [],
    data: {
      name: "TROOTT API",
      version: "1.0.0",
    },
    message: "troott api v1.0.0 is healthy",
    status: 200,
  });
});

export default router;
