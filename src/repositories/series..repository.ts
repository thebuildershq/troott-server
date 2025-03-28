import { Model } from "mongoose";
import Series from "../models/Series.model";
import { IResult, ISeriesDoc } from "../utils/interface.util";

class SeriesRepository {
  private model: Model<ISeriesDoc>;

  constructor() {
    this.model = Series;
  }

  /**
   * @name findById
   * @param id
   * @returns {Promise<IResult>}
   */
  public async findById(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const series = await this.model.findById(id);
    if (!series) {
      result.error = true;
      result.code = 404;
      result.message = "Series not found";
    } else {
      result.data = series;
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

    const series = await this.model.findOne({ title: new RegExp(title, "i") }).lean();
    if (!series) {
      result.error = true;
      result.code = 404;
      result.message = "Series not found";
    } else {
      result.data = series;
    }

    return result;
  }

  /**
   * @name getAllSeries
   * @param page
   * @param limit
   * @returns {Promise<IResult>}
   */
  public async getAllSeries(page: number = 1, limit: number = 10): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const series = await this.model
      .find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    result.data = series;

    return result;
  }

  /**
   * @name createSeries
   * @param seriesData
   * @returns {Promise<IResult>}
   */
  public async createSeries(seriesData: Partial<ISeriesDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newSeries = await this.model.create(seriesData);
    result.data = newSeries;
    result.message = "Series created successfully";

    return result;
  }

  /**
   * @name updateSeries
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateSeries(id: string, updateData: Partial<ISeriesDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedSeries = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedSeries) {
      result.error = true;
      result.code = 404;
      result.message = "Series not found";
    } else {
      result.message = "Series updated successfully";
      result.data = updatedSeries;
    }

    return result;
  }

  /**
   * @name deleteSeries
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deleteSeries(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedSeries = await this.model.findByIdAndDelete(id);
    if (!deletedSeries) {
      result.error = true;
      result.code = 404;
      result.message = "Series not found";
    } else {
      result.message = "Series deleted successfully";
      result.data = deletedSeries;
    }

    return result;
  }

  /**
   * @name getSeriesByPreacher
   * @param preacherId
   * @returns {Promise<IResult>}
   */
  public async getSeriesByPreacher(preacherId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const series = await this.model.find({ preacher: preacherId }).lean();
    result.data = series;

    return result;
  }

  /**
   * @name searchByTags
   * @param tags
   * @returns {Promise<IResult>}
   */
  public async searchByTags(tags: string[]): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const series = await this.model.find({ tags: { $in: tags } }).lean();
    result.data = series;

    return result;
  }

  /**
   * @name increasePlayCount
   * @param id
   * @returns {Promise<IResult>}
   */
  public async increasePlayCount(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedSeries = await this.model.findByIdAndUpdate(
      id,
      { $inc: { totalPlay: 1 } },
      { new: true }
    );

    if (!updatedSeries) {
      result.error = true;
      result.code = 404;
      result.message = "Series not found";
    } else {
      result.message = "Play count updated";
      result.data = updatedSeries;
    }

    return result;
  }

  /**
   * @name increaseShareCount
   * @param id
   * @returns {Promise<IResult>}
   */
  public async increaseShareCount(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedSeries = await this.model.findByIdAndUpdate(
      id,
      { $inc: { totalShares: 1 } },
      { new: true }
    );

    if (!updatedSeries) {
      result.error = true;
      result.code = 404;
      result.message = "Series not found";
    } else {
      result.message = "Share count updated";
      result.data = updatedSeries;
    }

    return result;
  }

  /**
   * @name increaseLikeCount
   * @param id
   * @returns {Promise<IResult>}
   */
  public async increaseLikeCount(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedSeries = await this.model.findByIdAndUpdate(
      id,
      { $inc: { totalLikes: 1 } },
      { new: true }
    );

    if (!updatedSeries) {
      result.error = true;
      result.code = 404;
      result.message = "Series not found";
    } else {
      result.message = "Like count updated";
      result.data = updatedSeries;
    }

    return result;
  }

  /**
   * @name softDeleteSeries
   * @param id
   * @param deletedBy
   * @param reason
   * @returns {Promise<IResult>}
   */
  public async softDeleteSeries(id: string, deletedBy: string, reason: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedSeries = await this.model.findByIdAndUpdate(
      id,
      {
        $push: {
          deletedSeries: {
            id,
            deletedBy,
            deletedAt: new Date(),
            reason,
          },
        },
      },
      { new: true }
    );

    if (!updatedSeries) {
      result.error = true;
      result.code = 404;
      result.message = "Series not found";
    } else {
      result.message = "Series soft deleted";
      result.data = updatedSeries;
    }

    return result;
  }
}

export default new SeriesRepository();
