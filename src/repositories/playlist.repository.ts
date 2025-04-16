import { Model } from "mongoose";
import Playlist from "../models/Playlist.model";
import { IResult, IPlaylistDoc } from "../utils/interface.util";

class PlaylistRepository {
  private model: Model<IPlaylistDoc>;

  constructor() {
    this.model = Playlist;
  }

  /**
   * @name findById
   * @param id
   * @returns {Promise<IResult>}
   */
  public async findById(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const playlist = await this.model.findById(id).populate("items.itemId").lean();
    if (!playlist) {
      result.error = true;
      result.code = 404;
      result.message = "Playlist not found";
    } else {
      result.data = playlist;
    }

    return result;
  }

  /**
   * @name findByTitle
   * @param title
   * @returns {Promise<IResult>}
   */
  public async findByTitle(title: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const playlist = await this.model.findOne({ title: new RegExp(title, "i") }).lean();
    if (!playlist) {
      result.error = true;
      result.code = 404;
      result.message = "Playlist not found";
    } else {
      result.data = playlist;
    }

    return result;
  }

  /**
   * @name getUserPlaylists
   * @param userId
   * @returns {Promise<IResult>}
   */
  public async getUserPlaylists(userId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const playlists = await this.model.find({ user: userId }).lean();
    result.data = playlists;

    return result;
  }

  /**
   * @name createPlaylist
   * @param playlistData
   * @returns {Promise<IResult>}
   */
  public async createPlaylist(playlistData: Partial<IPlaylistDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newPlaylist = await this.model.create(playlistData);
    result.data = newPlaylist;
    result.message = "Playlist created successfully";

    return result;
  }

  /**
   * @name updatePlaylist
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updatePlaylist(id: string, updateData: Partial<IPlaylistDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedPlaylist = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPlaylist) {
      result.error = true;
      result.code = 404;
      result.message = "Playlist not found";
    } else {
      result.message = "Playlist updated successfully";
      result.data = updatedPlaylist;
    }

    return result;
  }

  /**
   * @name deletePlaylist
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deletePlaylist(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedPlaylist = await this.model.findByIdAndDelete(id);
    if (!deletedPlaylist) {
      result.error = true;
      result.code = 404;
      result.message = "Playlist not found";
    } else {
      result.message = "Playlist deleted successfully";
      result.data = deletedPlaylist;
    }

    return result;
  }

  /**
   * @name addItemToPlaylist
   * @param playlistId
   * @param item
   * @returns {Promise<IResult>}
   */
  public async addItemToPlaylist(
    playlistId: string,
    item: { itemId: string; type: string }
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedPlaylist = await this.model.findByIdAndUpdate(
      playlistId,
      { $push: { items: item } },
      { new: true }
    );

    if (!updatedPlaylist) {
      result.error = true;
      result.code = 404;
      result.message = "Playlist not found";
    } else {
      result.message = "Item added to playlist";
      result.data = updatedPlaylist;
    }

    return result;
  }

  /**
   * @name removeItemFromPlaylist
   * @param playlistId
   * @param itemId
   * @returns {Promise<IResult>}
   */
  public async removeItemFromPlaylist(playlistId: string, itemId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedPlaylist = await this.model.findByIdAndUpdate(
      playlistId,
      { $pull: { items: { itemId } } },
      { new: true }
    );

    if (!updatedPlaylist) {
      result.error = true;
      result.code = 404;
      result.message = "Playlist not found";
    } else {
      result.message = "Item removed from playlist";
      result.data = updatedPlaylist;
    }

    return result;
  }

  /**
   * @name increaseLikeCount
   * @param playlistId
   * @returns {Promise<IResult>}
   */
  public async increaseLikeCount(playlistId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedPlaylist = await this.model.findByIdAndUpdate(
      playlistId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!updatedPlaylist) {
      result.error = true;
      result.code = 404;
      result.message = "Playlist not found";
    } else {
      result.message = "Like count increased";
      result.data = updatedPlaylist;
    }

    return result;
  }
}

export default new PlaylistRepository();
