import { Model } from "mongoose";
import Sermon from "../models/Sermon.model";
import { IResult, ISermonDoc } from "../utils/interface.util";

class SermonRepository {
  private model: Model<ISermonDoc>;

  constructor() {
    this.model = Sermon;
  }

  /**
   * @name findById
   * @param id
   * @returns {Promise<IResult>}
   */
  public async findById(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermon = await this.model.findById(id);
    if (!sermon) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon not found";
    } else {
      result.data = sermon;
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

    const sermon = await this.model.findOne({ title }).lean();
    if (!sermon) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon not found";
    } else {
      result.data = sermon;
    }

    return result;
  }

  /**
   * @name getSermons
   * @returns {Promise<IResult>}
   */
  public async getSermons(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermons = await this.model.find({}).lean();
    result.data = sermons;

    return result;
  }

  /**
   * @name createSermon
   * @param sermonData
   * @returns {Promise<IResult>}
   */
  public async createSermon(sermonData: Partial<ISermonDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newSermon = await this.model.create(sermonData);
    result.data = newSermon;
    result.message = "Sermon created successfully";

    return result;
  }

  /**
   * @name updateSermon
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateSermon(id: string, updateData: Partial<ISermonDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedSermon = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedSermon) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon not found";
    } else {
      result.message = "Sermon updated successfully";
      result.data = updatedSermon;
    }

    return result;
  }

  /**
   * @name deleteSermon
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deleteSermon(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedSermon = await this.model.findByIdAndDelete(id);
    if (!deletedSermon) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon not found";
    } else {
      result.message = "Sermon deleted successfully";
      result.data = deletedSermon;
    }

    return result;
  }

  /**
   * @name getSermonsByPreacher
   * @param preacherId
   * @returns {Promise<IResult>}
   */
  public async getSermonsByPreacher(preacherId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermons = await this.model.find({ preacher: preacherId }).lean();
    result.data = sermons;

    return result;
  }

  /**
   * @name getSermonsByCategory
   * @param category
   * @returns {Promise<IResult>}
   */
  public async getSermonsByCategory(category: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermons = await this.model.find({ category }).lean();
    result.data = sermons;

    return result;
  }

  /**
   * @name getSermonsBySeries
   * @param seriesId
   * @returns {Promise<IResult>}
   */
  public async getSermonsBySeries(seriesId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermons = await this.model.find({ series: seriesId }).lean();
    result.data = sermons;

    return result;
  }

  /**
   * @name getPublicSermons
   * @returns {Promise<IResult>}
   */
  public async getPublicSermons(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermons = await this.model.find({ isPublic: true }).lean();
    result.data = sermons;

    return result;
  }

  /**
   * @name getTrendingSermons
   * @returns {Promise<IResult>}
   */
  public async getTrendingSermons(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermons = await this.model.find({}).sort({ totalPlay: -1 }).limit(10).lean();
    result.data = sermons;

    return result;
  }
}

export default new SermonRepository();
