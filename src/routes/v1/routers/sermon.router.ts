import { Router } from "express";
import {
  deleteSermon,
  moveSermonToBin,
  publishSermon,
  updateSermon,
  uploadSermon,
  getSermonById,
  getSermonsByTopic,
  getAllSermons,
  getSermonsByPreacher,
  getSermonsByPreacherMostPlayed,
  getSermonsByPreacherMostLiked,
  getSermonsByPreacherMostShared,
  getSermonsByPreacherRecentlyPublished,
  getSermonsMostPlayed,
  getSermonsMostLiked,
  getSermonsMostShared,
  getSermonsRecentlyPublished,
  getRecentlyAddedSermons,
  getUserRecentlyPlayedSermons,
  getPopularSermonsRecentlyPlayed,
  getFavoritePreacherSermons,
  getSermonsByUserInterests
} from "../../../controllers/sermon.controller";

const sermonRouter = Router({ mergeParams: true });

// Upload and Publish routes
sermonRouter.post("/start-upload", uploadSermon);
sermonRouter.post("/publish", publishSermon);

// Update and Delete routes
sermonRouter.put("/update/:id", updateSermon);
sermonRouter.put("/move-to-bin/:id", moveSermonToBin);
sermonRouter.delete("/delete/:id", deleteSermon);

// Get single sermon
sermonRouter.get("/:id", getSermonById);

// Get sermons by topic
sermonRouter.get("/topic/:topic", getSermonsByTopic);

// Get all sermons
sermonRouter.get("/", getAllSermons);

// Preacher-specific routes
sermonRouter.get("/preacher/:preacherId", getSermonsByPreacher);
sermonRouter.get("/preacher/:preacherId/most-played", getSermonsByPreacherMostPlayed);
sermonRouter.get("/preacher/:preacherId/most-liked", getSermonsByPreacherMostLiked);
sermonRouter.get("/preacher/:preacherId/most-shared", getSermonsByPreacherMostShared);
sermonRouter.get("/preacher/:preacherId/recently-published", getSermonsByPreacherRecentlyPublished);

// Global sermon statistics routes
sermonRouter.get("/stats/most-played", getSermonsMostPlayed);
sermonRouter.get("/stats/most-liked", getSermonsMostLiked);
sermonRouter.get("/stats/most-shared", getSermonsMostShared);
sermonRouter.get("/stats/recently-published", getSermonsRecentlyPublished);

// User-specific sermon routes
sermonRouter.get("/user/recently-added", getRecentlyAddedSermons);
sermonRouter.get("/user/recently-played", getUserRecentlyPlayedSermons);
sermonRouter.get("/user/popular", getPopularSermonsRecentlyPlayed);
sermonRouter.get("/user/favorite-preachers", getFavoritePreacherSermons);
sermonRouter.get("/user/interests", getSermonsByUserInterests);

export default sermonRouter;