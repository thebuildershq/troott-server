import { Router } from "express";
import { createLibrary, deleteLibrary, getAllLibraries, getLibraryById, getLibraryByUser, updateLibrary } from "../../../controllers/library.controller";

const libraryRouter = Router({ mergeParams: true });

libraryRouter.post("/", createLibrary);
libraryRouter.get("/:id", getLibraryById);
libraryRouter.get("/:userId", getLibraryByUser);
libraryRouter.get("/", getAllLibraries);
libraryRouter.put("/userId", updateLibrary);
libraryRouter.delete("/userId", deleteLibrary);

export default libraryRouter;