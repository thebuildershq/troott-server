import { Request, Response, NextFunction } from "express";
import playlistRepository from "../repositories/playlist.repository";
import asyncHandler from "../middlewares/async.mdw";
import ErrorResponse from "../utils/error.util";

/**
 * @name createPlaylist
 * @route POST /api/v1/playlist
 * @access Private
 */
export const createPlaylist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const data = req.body;

    const result = await playlistRepository.createPlaylist(data);

    if (result.error)
      return next(new ErrorResponse(result.message, result.code, []));
    res.status(result.code).json({
      error: false,
      errors: [],
      message: result.message,
      status: result.code,
      data: result.data,
    });
  }
);

/**
 * @name getPlaylistById
 * @route GET /api/v1/playlists/:id
 * @access Public/Private (depends on your auth)
 */
export const getPlaylistById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const { id } = req.params;

    const result = await playlistRepository.findById(id);
    if (result.error)
      return next(new ErrorResponse(result.message, result.code, []));
  
    res.status(result.code).json({
      error: false,
      errors: [],
      message: "Playlist fetched successfully",
      status: result.code,
      data: result.data,
    });
  }
);

/**
 * @name getPlaylistsByUser
 * @route GET /api/v1/playlists/user/:userId
 * @access Private
 */
export const getPlaylistsByUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const { userId } = req.params;

    const result = await playlistRepository.findByUser(userId);
    if (result.error)
      return next(new ErrorResponse(result.message, result.code, []));
    
    res.status(result.code).json({
      error: false,
      errors: [],
      message: "User playlists fetched successfully",
      status: result.code,
      data: result.data,
    });
  }
);

/**
 * @name getAllPlaylists
 * @route GET /api/v1/playlists
 * @access Public/Private (depends)
 */
export const getAllPlaylists = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const filters = req.query.filters || {};
    
    const options = {
      sort: req.query.sort as string,
      skip: Number(req.query.skip) || 0,
      limit: Number(req.query.limit) || 25,
      populate: "items.itemId user createdBy",
    };

    const result = await playlistRepository.findAll(filters, options);
    if (result.error)
      return next(new ErrorResponse(result.message, result.code, []));

    res.status(result.code).json({
      error: false,
      errors: [],
      message: "All playlists fetched successfully",
      status: result.code,
      data: result.data,
    });
  }
);

/**
 * @name updatePlaylist
 * @route PUT /api/v1/playlists/:id
 * @access Private
 */
export const updatePlaylist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const { id } = req.params;
    const updates = req.body;

    const result = await playlistRepository.updatePlaylist(id, updates);
    if (result.error)
      return next(new ErrorResponse(result.message, result.code, []));

    res.status(result.code).json({
      error: false,
      errors: [],
      message: result.message,
      status: result.code,
      data: result.data,
    });
  }
);

/**
 * @name deletePlaylist
 * @route DELETE /api/v1/playlists/:id
 * @access Private
 */
export const deletePlaylist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await playlistRepository.deletePlaylist(id);
    if (result.error)
      return next(new ErrorResponse(result.message, result.code, []));

    res.status(result.code).json({
      error: false,
      errors: [],
      message: result.message,
      status: result.code,
      data: {},
    });
  }
);

// playlist controller

// create playlist
// add to library
// toogle private or public
// get all user library items
// get all user playlist
// get a user playlist
// get a playlist (with items in in)
// add an item to playlist
// sermon
// sermon bites
// preacher
// remove an item to playlist
// sermon
// sermon bites
// preacher

// update user playlist
// delete user playlist
// follow a playlist
// unfollow a playlist
// share a playlist
