import { Model, ObjectId, Types } from "mongoose";
import Sermon from "../models/Sermon.model";
import UploadSermon from "../models/Upload.model";
import {
  IQueryOptions,
  IResult,
  ISermonDoc,
  IUploadDoc,
} from "../utils/interface.util";
import { PipelineStage } from "mongoose";

class SermonRepository {
  private SermonModel: Model<ISermonDoc>;
  private UploadSermonModel: Model<IUploadDoc>;

  constructor() {
    this.SermonModel = Sermon;
    this.UploadSermonModel = UploadSermon;
  }

  /**
   * @name findById
   * @description Find a sermon by Uplaod ID
   * @param id
   * @returns {Promise<IResult>}
   */
  public async findByUploadId(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermon = await this.UploadSermonModel.findById(id);
    if (!sermon) {
      result.error = true;
      result.code = 404;
      result.message = "Not found: Upload sermon again";
    } else {
      result.data = sermon;
    }

    return result;
  }

  /**
   * @name updateSermon
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateSermon(
    id: string,
    updateData: Partial<ISermonDoc>
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const objectId = new Types.ObjectId(id);
    const updatedSermon = await this.SermonModel.findByIdAndUpdate(
      objectId,
      updateData,
      { new: true }
    );
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
   * @param deleteData
   * @returns {Promise<IResult>}
   */
  public async deleteSermon(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const objectId = new Types.ObjectId(id);
    const deletedSermon = await this.SermonModel.findByIdAndUpdate(objectId);
    if (!deletedSermon) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon not found";
    } else {
      result.message = "Sermon deleted Successfully";
      result.data = deletedSermon;
    }

    return result;
  }

  /**
   * @name moveSermonToBin
   * @param id
   * @param deleteData
   * @returns {Promise<IResult>}
   */
  public async moveSermonToBin(
    id: string,
    deleteData: Partial<ISermonDoc>
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const objectId = new Types.ObjectId(id);
    const deletedSermon = await this.SermonModel.findByIdAndUpdate(
      objectId,
      deleteData
    );
    if (!deletedSermon) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon not found";
    } else {
      result.message = "Sermon moved to bin";
      result.data = deletedSermon;
    }

    return result;
  }

  /**
   * @name findById
   * @description Find a sermon by ID
   * @param id
   * @returns {Promise<IResult>}
   */
  public async findBySermonId(id: string | ObjectId): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermon = await this.SermonModel.findById(id);
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
   * @name findAll
   * @description Fetch all sermons with optional filters, pagination, and sorting
   * @returns {Promise<IResult>}
   */
  public async findAll(
    filters = {},
    options: IQueryOptions = {}
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermons = await this.SermonModel.find(filters)
      .sort(options.sort || "-createdAt")
      .skip(options.skip || 0)
      .limit(options.limit || 25)
      .populate(options.populate || "");

    if (!sermons) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon not found";
    } else {
      result.data = sermons;
    }

    return result;
  }

  /**
   * @name findByTopic
   * @description Fetch all sermons with optional filters, pagination, and sorting
   * @returns {Promise<IResult>}
   */
  public async findByTopic(
    topic: string,
    options: IQueryOptions = {}
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermons = await this.SermonModel.find({ topic })
      .sort(options.sort || "-createdAt")
      .skip(options.skip || 0)
      .limit(options.limit || 25)
      .populate(options.populate || "");

    if (!sermons) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon not found";
    } else {
      result.data = sermons;
    }

    return result;
  }

  /**
   * @name getSermonsByPreacher
   * @param preacherId
   * @returns {Promise<IResult>}
   */
  public async getSermonsByPreacher(
    preacherId: string,
    options: IQueryOptions = {}
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermons = await this.SermonModel.find({ preacher: preacherId })
      .sort(options.sort || "-createdAt")
      .skip(options.skip || 0)
      .limit(options.limit || 25)
      .populate(options.populate || "");

    if (!sermons) {
      result.error = true;
      result.code = 404;
      result.message = "Sermon not found";
    } else {
      result.data = sermons;
    }

    return result;
  }

  /**
   * @name findByPreacherSorted
   * @description Get sermons by preacher sorted by given field (plays, likes, shares, or release date)
   * @param preacherId
   * @param sortField - e.g. "playCount", "likeCount", "shareCount", "releaseDate"
   * @param options
   * @returns {Promise<IResult>}
   */
  public async findByPreacherSorted(
    preacherId: string | ObjectId,
    sortField: "playCount" | "likeCount" | "shareCount" | "releaseDate",
    options: IQueryOptions = {}
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const matchStage: any = {
      preacher: preacherId,
      state: { $ne: "DELETED" }, // Adjust based on your enums
      status: { $ne: "DELETED" },
      isPublic: true,
    };

    // If recently published: only last week
    if (sortField === "releaseDate" && options.recentOnly) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      matchStage.releaseDate = { $gte: oneWeekAgo };
    }

    // Map for sorting based on computed fields or releaseDate
    const sortMap: Record<string, any> = {
      playCount: { playCount: -1 },
      likeCount: { likeCount: -1 },
      shareCount: { shareCount: -1 },
      releaseDate: { releaseDate: -1 },
    };

    const pipeline: any[] = [
      { $match: matchStage },
      // Add computed count fields dynamically from arrays
      {
        $addFields: {
          playCount: { $size: { $ifNull: ["$totalPlay", []] } },
          likeCount: { $size: { $ifNull: ["$totalLikes", []] } },
          shareCount: { $size: { $ifNull: ["$totalShares", []] } },
        },
      },

      { $sort: sortMap[sortField] },

      { $skip: options.skip || 0 },
      { $limit: options.limit || 25 },
    ];

    let sermons = await this.SermonModel.aggregate(pipeline).exec();

    // Populate after aggregation (if populate is set)
    if (options.populate) {
      sermons = await this.SermonModel.populate(sermons, options.populate);
    } else {
      // default populate like your old function
      sermons = await this.SermonModel.populate(sermons, [
        { path: "preacher" },
        { path: "series" },
        { path: "topic" },
      ]);
    }

    if (!sermons || sermons.length === 0) {
      result = {
        error: true,
        message: "No sermons found",
        code: 404,
        data: [],
      };
    } else {
      result.data = sermons;
    }

    return result;
  }

  /**
   * @name findAllSorted
   * @description Fetch sermons across all preachers sorted by a specific field
   * @param {"playCount" | "likeCount" | "shareCount" | "releaseDate"} sortField - Field to sort by
   * @param {IQueryOptions} options - Optional query options (pagination, populate, recentOnly)
   * @returns {Promise<IResult>} - Result object with sermons or error message
   */
  public async findAllSorted(
    sortField: "playCount" | "likeCount" | "shareCount" | "releaseDate",
    options: IQueryOptions = {}
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const matchStage: any = {
      state: { $ne: "DELETED" },
      status: { $ne: "DELETED" },
      isPublic: true,
    };

    if (sortField === "releaseDate" && options.recentOnly) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      matchStage.releaseDate = { $gte: oneWeekAgo };
    }

    const sortMap: Record<string, any> = {
      playCount: { playCount: -1 },
      likeCount: { likeCount: -1 },
      shareCount: { shareCount: -1 },
      releaseDate: { releaseDate: -1 },
    };

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $addFields: {
          playCount: { $size: { $ifNull: ["$totalPlay", []] } },
          likeCount: { $size: { $ifNull: ["$totalLikes", []] } },
          shareCount: { $size: { $ifNull: ["$totalShares", []] } },
        },
      },
      { $sort: sortMap[sortField] },
      { $skip: options.skip || 0 },
      { $limit: options.limit || 25 },
    ];

    let sermons = await this.SermonModel.aggregate(pipeline).exec();

    sermons = await this.SermonModel.populate(
      sermons,
      options.populate || [
        { path: "preacher" },
        { path: "series" },
        { path: "topic" },
      ]
    );

    if (!sermons.length) {
      result = {
        error: true,
        message: "No sermons found",
        code: 404,
        data: [],
      };
    } else {
      result.data = sermons;
      result.message = "Sermons retrieved successfully";
    }

    return result;
  }

  /**
   * @name findRecentlyAddedMonthly
   * @description Fetch recently added sermons within the last 30 days
   * @param {IQueryOptions} options - Optional query options (pagination, populate)
   * @returns {Promise<IResult>} - Result object with sermons or error message
   */
  public async findRecentlyAddedMonthly(
    options: IQueryOptions = {}
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filters = {
      releaseDate: { $gte: thirtyDaysAgo },
      state: { $ne: "DELETED" },
      status: { $ne: "DELETED" },
      isPublic: true,
    };

    let query = this.SermonModel.find(filters)
      .sort("-releaseDate")
      .skip(options.skip || 0)
      .limit(options.limit || 25);

    if (options.populate) {
      query = query.populate(options.populate);
    }

    const sermons = await query.exec();

    if (!sermons || sermons.length === 0) {
      result = {
        error: true,
        message: "No sermons found",
        code: 404,
        data: [],
      };
    } else {
      result.data = sermons;
      result.message = "Recently added sermons retrieved successfully";
    }
    return result;
  }

  /**
   * Get sermons recently played by a specific user
   */
  public async findRecentlyPlayedByUser(
    userId: string | ObjectId,
    options: IQueryOptions = {}
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const filters = {
      "totalPlay.userId": userId,
      state: { $ne: "DELETED" },
      status: { $ne: "DELETED" },
      isPublic: true,
    };

    // Sort by most recent play (using totalPlay.playedAt)
    // We do aggregation because totalPlay is an array
    const pipeline: PipelineStage[] = [];

    pipeline.push({
      $match: {
        "totalPlay.userId": userId,
        state: { $ne: "deleted" },
        status: { $ne: "draft" },
        isPublic: true,
      },
    });

    pipeline.push({ $unwind: "$totalPlay" });

    pipeline.push({
      $sort: {
        "totalPlay.playedAt": -1,
      },
    });

    pipeline.push({
      $group: {
        _id: "$_id",
        sermon: { $first: "$$ROOT" },
        lastPlayedAt: { $max: "$totalPlay.playedAt" },
      },
    });

    pipeline.push({
      $sort: {
        lastPlayedAt: -1,
      },
    });

    pipeline.push({ $skip: options.skip || 0 });
    pipeline.push({ $limit: options.limit || 25 });

    let sermons = await this.SermonModel.aggregate(pipeline).exec();

    if (options.populate) {
      sermons = await this.SermonModel.populate(
        sermons.map((s) => s.doc),
        options.populate
      );
    } else {
      sermons = await this.SermonModel.populate(
        sermons.map((s) => s.doc),
        [{ path: "preacher" }, { path: "series" }, { path: "category" }]
      );
    }

    if (!sermons || sermons.length === 0) {
      result = {
        error: true,
        message: "No sermons found",
        code: 404,
        data: [],
      };
    } else {
      result.data = sermons;
      result.message = "Recently played sermons retrieved successfully";
    }

    return result;
  }

  /**
   * Get sermons most recently played by any user - popular/recommended
   */
  public async findMostRecentlyPlayed(
    options: IQueryOptions = {}
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const pipeline: PipelineStage[] = [];

    pipeline.push({
      $match: {
        state: { $ne: "deleted" },
        status: { $ne: "deleted" },
        isPublic: true,
      },
    });

    pipeline.push({ $unwind: "$totalPlay" });

    pipeline.push({
      $sort: {
        "totalPlay.playedAt": -1,
      },
    });

    pipeline.push({
      $group: {
        _id: "$_id",
        doc: { $first: "$$ROOT" },
        lastPlayedAt: { $max: "$totalPlay.playedAt" },
      },
    });

    pipeline.push({
      $sort: {
        lastPlayedAt: -1,
      },
    });

    pipeline.push({ $skip: options.skip || 0 });
    pipeline.push({ $limit: options.limit || 25 });

    let sermons = await this.SermonModel.aggregate(pipeline).exec();

    if (options.populate) {
      sermons = await this.SermonModel.populate(
        sermons.map((s) => s.doc),
        options.populate
      );
    } else {
      sermons = await this.SermonModel.populate(
        sermons.map((s) => s.doc),
        [{ path: "preacher" }, { path: "series" }, { path: "category" }]
      );
    }

    if (!sermons || sermons.length === 0) {
      result = {
        error: true,
        message: "No sermons found",
        code: 404,
        data: [],
      };
    } else {
      result.data = sermons;
      result.message = "Most recently played sermons retrieved successfully";
    }

    return result;
  }

  /**
   * Get sermons from a user's favorite preachers (random list)
   */
  public async findFavoritePreachersSermonsRandom(
    favoritePreacherIds: Array<string | ObjectId>,
    options: IQueryOptions = {}
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      if (!favoritePreacherIds || favoritePreacherIds.length === 0) {
        return {
          error: true,
          message: "No favorite preachers provided",
          code: 400,
          data: [],
        };
      }

      const filters = {
        preacher: { $in: favoritePreacherIds.map((id) => id) },
        state: { $ne: "DELETED" },
        status: { $ne: "DELETED" },
        isPublic: true,
      };

      const count = await this.SermonModel.countDocuments(filters);

      if (count === 0) {
        return {
          error: true,
          message: "No sermons found for favorite preachers",
          code: 404,
          data: [],
        };
      }

      const randomSkip = Math.floor(
        Math.random() * Math.max(0, count - (options.limit || 25))
      );

      let query = this.SermonModel.find(filters)
        .skip(randomSkip)
        .limit(options.limit || 25);

      if (options.populate) {
        query = query.populate(options.populate);
      } else {
        query = query.populate(["preacher", "series", "topic"]);
      }

      const sermons = await query.exec();

      if (!sermons || sermons.length === 0) {
        result = {
          error: true,
          message: "No sermons found",
          code: 404,
          data: [],
        };
      } else {
        result.data = sermons;
        result.message = "Favorite preachers sermons retrieved successfully";
      }
    } catch (error: any) {
      result = {
        error: true,
        message: error.message || "Server error",
        code: 500,
        data: [],
      };
    }

    return result;
  }

  /**
   * Get sermons based on user interests (e.g. tags or topics)
   */
  public async findByUserInterests(
    interests: string[], // array of tags/topics
    options: IQueryOptions = {}
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      if (!interests || interests.length === 0) {
        return {
          error: true,
          message: "No interests provided",
          code: 400,
          data: [],
        };
      }

      const filters = {
        $or: [{ tags: { $in: interests } }, { topic: { $in: interests } }],
        state: { $ne: "DELETED" },
        status: { $ne: "DELETED" },
        isPublic: true,
      };

      let query = this.SermonModel.find(filters)
        .sort("-releaseDate")
        .skip(options.skip || 0)
        .limit(options.limit || 25);

      if (options.populate) {
        query = query.populate(options.populate);
      } else {
        query = query.populate(["preacher", "series", "topic"]);
      }

      const sermons = await query.exec();

      if (!sermons || sermons.length === 0) {
        result = {
          error: true,
          message: "No sermons found",
          code: 404,
          data: [],
        };
      } else {
        result.data = sermons;
        result.message =
          "Sermons based on user interests retrieved successfully";
      }
    } catch (error: any) {
      result = {
        error: true,
        message: error.message || "Server error",
        code: 500,
        data: [],
      };
    }

    return result;
  }

  //   const sortOption =
  //   sortField === "releaseDate" ? "-releaseDate" : `-${sortField}`;
  // const filters = { preacher: preacherId };

  //   const sermons = await this.SermonModel.find(filters)
  //     .sort(sortOption)
  //     .skip(options.skip || 0)
  //     .limit(options.limit || 25)
  //     .populate(options.populate || "preacher series category");

  /**
   * @name createSermon
   * @param sermonData
   * @returns {Promise<IResult>}
   */
  public async createSermon(sermonData: Partial<ISermonDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newSermon = await this.SermonModel.create(sermonData);
    result.data = newSermon;
    result.message = "Sermon created successfully";

    return result;
  }

  /**
   * @name getSermonsByCategory
   * @param category
   * @returns {Promise<IResult>}
   */
  public async getSermonsByCategory(category: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermons = await this.SermonModel.find({ category }).lean();
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

    const sermons = await this.SermonModel.find({ series: seriesId }).lean();
    result.data = sermons;

    return result;
  }

  /**
   * @name getPublicSermons
   * @returns {Promise<IResult>}
   */
  public async getPublicSermons(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermons = await this.SermonModel.find({ isPublic: true }).lean();
    result.data = sermons;

    return result;
  }

  /**
   * @name getTrendingSermons
   * @returns {Promise<IResult>}
   */
  public async getTrendingSermons(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const sermons = await this.SermonModel.find({})
      .sort({ totalPlay: -1 })
      .limit(10)
      .lean();
    result.data = sermons;

    return result;
  }
}

export default new SermonRepository();

// Use this safely with mongoose aggregate
// const pipeline = [
//   { $match: filters },
//   { $unwind: "$totalPlay" },
//   { $match: { "totalPlay.userId": userId } },
//   {
//     $sort: {
//       "totalPlay.playedAt": -1,
//     },
//   },
//   {
//     $group: {
//       _id: "$_id",
//       doc: { $first: "$$ROOT" },
//       lastPlayedAt: { $max: "$totalPlay.playedAt" },
//     },
//   },
//   { $sort: { lastPlayedAt: -1 } },
//   { $skip: options.skip || 0 },
//   { $limit: options.limit || 25 },
// ];
