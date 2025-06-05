import { Router } from "express";
import {
  createPreferences,
  deletePreferences,
  getAllPreferences,
  getUserPreferences,
  updatePreferences,
} from "../../../controllers/preference.controller";

const preferenceRouter = Router({ mergeParams: true });

preferenceRouter.post("/", createPreferences);
preferenceRouter.get("/:userId", getUserPreferences);
preferenceRouter.patch("/:userId", updatePreferences);
preferenceRouter.delete("/;userId", deletePreferences);
preferenceRouter.get("/", getAllPreferences);

export default preferenceRouter;
