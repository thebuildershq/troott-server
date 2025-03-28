import { Model } from "mongoose";
import Library from "../models/Library.model";
import { IResult, ILibraryDoc } from "../utils/interface.util";

class LibraryRepository {
  private model: Model<ILibraryDoc>;

  constructor() {
    this.model = Library;
  }

  /**
   * @name findById
   * @param id
   * @returns {Promise<IResult>}
   */
  public async findById(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const library = await this.model.findById(id);
    if (!library) {
      result.error = true;
      result.code = 404;
      result.message = "Library not found";
    } else {
      result.data = library;
    }

    return result;
  }

  /**
   * @name findByUser
   * @param userId
   * @returns {Promise<IResult>}
   */
  public async findByUser(userId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const library = await this.model.findOne({ user: userId }).lean();
    if (!library) {
      result.error = true;
      result.code = 404;
      result.message = "Library not found";
    } else {
      result.data = library;
    }

    return result;
  }

  /**
   * @name createLibrary
   * @param libraryData
   * @returns {Promise<IResult>}
   */
  public async createLibrary(libraryData: Partial<ILibraryDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newLibrary = await this.model.create(libraryData);
    result.data = newLibrary;
    result.message = "Library created successfully";

    return result;
  }

  /**
   * @name updateLibrary
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateLibrary(id: string, updateData: Partial<ILibraryDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedLibrary = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedLibrary) {
      result.error = true;
      result.code = 404;
      result.message = "Library not found";
    } else {
      result.message = "Library updated successfully";
      result.data = updatedLibrary;
    }

    return result;
  }

  /**
   * @name deleteLibrary
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deleteLibrary(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedLibrary = await this.model.findByIdAndDelete(id);
    if (!deletedLibrary) {
      result.error = true;
      result.code = 404;
      result.message = "Library not found";
    } else {
      result.message = "Library deleted successfully";
      result.data = deletedLibrary;
    }

    return result;
  }

  /**
   * @name addLikedSermon
   * @param userId
   * @param sermonId
   * @returns {Promise<IResult>}
   */
  public async addLikedSermon(userId: string, sermonId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedLibrary = await this.model.findOneAndUpdate(
      { user: userId },
      { $addToSet: { likedSermons: sermonId } },
      { new: true }
    );

    if (!updatedLibrary) {
      result.error = true;
      result.code = 404;
      result.message = "Library not found";
    } else {
      result.message = "Sermon added to liked list";
      result.data = updatedLibrary;
    }

    return result;
  }

  /**
   * @name removeLikedSermon
   * @param userId
   * @param sermonId
   * @returns {Promise<IResult>}
   */
  public async removeLikedSermon(userId: string, sermonId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedLibrary = await this.model.findOneAndUpdate(
      { user: userId },
      { $pull: { likedSermons: sermonId } },
      { new: true }
    );

    if (!updatedLibrary) {
      result.error = true;
      result.code = 404;
      result.message = "Library not found";
    } else {
      result.message = "Sermon removed from liked list";
      result.data = updatedLibrary;
    }

    return result;
  }

  /**
   * @name addSavedBite
   * @param userId
   * @param biteId
   * @returns {Promise<IResult>}
   */
  public async addSavedBite(userId: string, biteId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedLibrary = await this.model.findOneAndUpdate(
      { user: userId },
      { $addToSet: { savedBtes: biteId } },
      { new: true }
    );

    if (!updatedLibrary) {
      result.error = true;
      result.code = 404;
      result.message = "Library not found";
    } else {
      result.message = "Sermon Bite saved successfully";
      result.data = updatedLibrary;
    }

    return result;
  }

  /**
   * @name removeSavedBite
   * @param userId
   * @param biteId
   * @returns {Promise<IResult>}
   */
  public async removeSavedBite(userId: string, biteId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedLibrary = await this.model.findOneAndUpdate(
      { user: userId },
      { $pull: { savedBtes: biteId } },
      { new: true }
    );

    if (!updatedLibrary) {
      result.error = true;
      result.code = 404;
      result.message = "Library not found";
    } else {
      result.message = "Sermon Bite removed from saved list";
      result.data = updatedLibrary;
    }

    return result;
  }

  /**
   * @name addFavouritePreacher
   * @param userId
   * @param preacherId
   * @returns {Promise<IResult>}
   */
  public async addFavouritePreacher(userId: string, preacherId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedLibrary = await this.model.findOneAndUpdate(
      { user: userId },
      { $addToSet: { favouritePreachers: preacherId } },
      { new: true }
    );

    if (!updatedLibrary) {
      result.error = true;
      result.code = 404;
      result.message = "Library not found";
    } else {
      result.message = "Preacher added to favourites";
      result.data = updatedLibrary;
    }

    return result;
  }

  /**
   * @name removeFavouritePreacher
   * @param userId
   * @param preacherId
   * @returns {Promise<IResult>}
   */
  public async removeFavouritePreacher(userId: string, preacherId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedLibrary = await this.model.findOneAndUpdate(
      { user: userId },
      { $pull: { favouritePreachers: preacherId } },
      { new: true }
    );

    if (!updatedLibrary) {
      result.error = true;
      result.code = 404;
      result.message = "Library not found";
    } else {
      result.message = "Preacher removed from favourites";
      result.data = updatedLibrary;
    }

    return result;
  }
}

export default new LibraryRepository();
