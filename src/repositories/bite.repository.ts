import { Model } from "mongoose";
import SermonBite from "../models/Bite.model";
import { IResult, ISermonBiteDoc } from "../utils/interface.util";

class SermonBiteRepository {
  private model: Model<ISermonBiteDoc>;

  constructor() {
    this.model = SermonBite;
  }

  /**
   * @name findById
   * @param id
   * @returns {Promise<IResult>}
   */
  public async findById(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const bite = await this.model.findById(id);
    if (!bite) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon Bite not found";
    } else {
      result.data = bite;
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

    const bite = await this.model.findOne({ title }).lean();
    if (!bite) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon Bite not found";
    } else {
      result.data = bite;
    }

    return result;
  }

  /**
   * @name getSermonBites
   * @returns {Promise<IResult>}
   */
  public async getSermonBites(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const bites = await this.model.find({}).lean();
    result.data = bites;

    return result;
  }

  /**
   * @name createSermonBite
   * @param biteData
   * @returns {Promise<IResult>}
   */
  public async createSermonBite(
    biteData: Partial<ISermonBiteDoc>
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newBite = await this.model.create(biteData);
    result.data = newBite;
    result.message = "Sermon Bite created successfully";

    return result;
  }

  /**
   * @name updateSermonBite
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateSermonBite(
    id: string,
    updateData: Partial<ISermonBiteDoc>
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedBite = await this.model.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedBite) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon Bite not found";
    } else {
      result.message = "Sermon Bite updated successfully";
      result.data = updatedBite;
    }

    return result;
  }

  /**
   * @name deleteSermonBite
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deleteSermonBite(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedBite = await this.model.findByIdAndDelete(id);
    if (!deletedBite) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon Bite not found";
    } else {
      result.message = "Sermon Bite deleted successfully";
      result.data = deletedBite;
    }

    return result;
  }

  /**
   * @name getBitesByPreacher
   * @param preacherId
   * @returns {Promise<IResult>}
   */
  public async getBitesByPreacher(preacherId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const bites = await this.model.find({ preacher: preacherId }).lean();
    result.data = bites;

    return result;
  }

  /**
   * @name increaseViewCount
   * @param id
   * @returns {Promise<IResult>}
   */
  public async increaseViewCount(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedBite = await this.model.findByIdAndUpdate(
      id,
      { $inc: { "engagementStats.views": 1 } },
      { new: true }
    );

    if (!updatedBite) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon Bite not found";
    } else {
      result.message = "View count updated";
      result.data = updatedBite;
    }

    return result;
  }

  /**
   * @name softDeleteSermonBite
   * @param id
   * @returns {Promise<IResult>}
   */
  public async softDeleteSermonBite(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedBite = await this.model.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!updatedBite) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon Bite not found";
    } else {
      result.message = "Sermon Bite soft deleted";
      result.data = updatedBite;
    }

    return result;
  }
}

export default new SermonBiteRepository();
