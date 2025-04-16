import { ObjectId } from 'mongoose';
import SermonBite from '../models/bite.model';
import UserPreference from '../models/UserPreference.model';
import UserInteraction from '../models/UserInteraction.model';
import UserFollowing from '../models/UserFollowing.model';
import { IResult } from '../utils/interface.util';

class FeedService {
  private readonly BATCH_SIZE = 10;
  private readonly CREATOR_CAP_PER_BATCH = 3;
  private readonly TRENDING_THRESHOLD_DAYS = 7;
  private readonly NEW_RELEASE_DAYS = 7;
  private readonly RECENTLY_ADDED_DAYS = 30;

  public async generateNewUserFeed(userId: ObjectId, page: number): Promise<IResult> {
    try {
      const trendingBites = await this.getTrendingBites();
      const newReleases = await this.getNewReleases();
      const popularBites = await this.getPopularBites();

      const combinedFeed = this.shuffleAndDeduplicate([
        ...trendingBites,
        ...newReleases,
        ...popularBites
      ], this.BATCH_SIZE);

      return {
        error: false,
        message: 'Feed generated successfully',
        code: 200,
        data: {
          bites: combinedFeed,
          hasMore: combinedFeed.length === this.BATCH_SIZE,
          nextPage: page + 1
        }
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message,
        code: 500,
        data: null
      };
    }
  }

  public async generatePersonalizedFeed(userId: ObjectId, page: number): Promise<IResult> {
    try {
      const [preferences, interactions, following] = await Promise.all([
        UserPreference.findOne({ user: userId }),
        UserInteraction.find({ user: userId }).sort({ createdAt: -1 }).limit(100),
        UserFollowing.find({ follower: userId })
      ]);

      const recommendationQuery = this.buildRecommendationQuery(
        preferences,
        interactions,
        following
      );

      const personalizedBites = await this.getPersonalizedBites(recommendationQuery);

      return {
        error: false,
        message: 'Personalized feed generated successfully',
        code: 200,
        data: {
          bites: personalizedBites,
          hasMore: personalizedBites.length === this.BATCH_SIZE,
          nextPage: page + 1
        }
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message,
        code: 500,
        data: null
      };
    }
  }

  private async buildRecommendationQuery(
    preferences: any,
    interactions: any[],
    following: any[]
  ): object {
    const query: any = {
      isPublic: true,
      state: 'active',
      status: 'published'
    };

    // Add engagement-based sorting
    const engagementSort = {
      $addFields: {
        engagementScore: {
          $add: [
            { $multiply: [{ $size: '$likeHistory' }, 0.3] },
            { $multiply: [{ $size: '$shareHistory' }, 0.4] },
            { $multiply: [{ $size: '$viewHistory' }, 0.2] },
            { $multiply: ['$engagementStats.completionRate', 0.5] },
            { $multiply: ['$engagementStats.avgWatchTime', 0.3] },
            { $multiply: ['$engagementStats.totalSaves', 0.2] }
          ]
        }
      }
    };

    // Add category-based filtering
    if (preferences?.categories?.length) {
      query.category = { $in: preferences.categories };
    }

    // Add interaction-based filtering
    const viewedBites = interactions
      .filter(i => i.type === 'view')
      .map(i => i.bite);
    
    const savedBites = interactions
      .filter(i => i.type === 'save')
      .map(i => i.bite);

    // Exclude already viewed and saved bites
    query._id = { 
      $nin: [...viewedBites, ...savedBites]
    };

    // Add creator/preacher following preferences
    if (following.length) {
      query.$or = [
        { preacher: { $in: following.map(f => f.following) } },
        { creator: { $in: following.map(f => f.following) } }
      ];
    }

    return {
      ...query,
      ...engagementSort
    };
  }

  private async getTrendingBites(): Promise<any[]> {
    return SermonBite.aggregate([
      {
        $match: {
          createdAt: { 
            $gte: new Date(Date.now() - this.TRENDING_THRESHOLD_DAYS * 24 * 60 * 60 * 1000) 
          },
          isPublic: true,
          state: 'active'
        }
      },
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $multiply: [{ $size: '$likeHistory' }, 0.3] },
              { $multiply: [{ $size: '$shareHistory' }, 0.4] },
              { $multiply: ['$engagementStats.totalViews', 0.2] },
              { $multiply: ['$engagementStats.completionRate', 0.5] }
            ]
          }
        }
      },
      { $sort: { engagementScore: -1 } },
      { $limit: this.BATCH_SIZE }
    ]);
  }

  private async getNewReleases(): Promise<any[]> {
    return SermonBite.find({
      createdAt: {
        $gte: new Date(Date.now() - this.NEW_RELEASE_DAYS * 24 * 60 * 60 * 1000)
      },
      isPublic: true,
      state: 'active',
      status: 'published'
    })
    .sort({ createdAt: -1 })
    .limit(this.BATCH_SIZE)
    .populate('preacher creator', 'firstName lastName avatar');
  }

  private async getPopularBites(): Promise<any[]> {
    return SermonBite.aggregate([
      {
        $match: {
          isPublic: true,
          state: 'active',
          status: 'published'
        }
      },
      {
        $addFields: {
          popularityScore: {
            $add: [
              { $multiply: [{ $size: '$viewHistory' }, 0.4] },
              { $multiply: [{ $size: '$likeHistory' }, 0.3] },
              { $multiply: [{ $size: '$shareHistory' }, 0.3] }
            ]
          }
        }
      },
      { $sort: { popularityScore: -1 } },
      { $limit: this.BATCH_SIZE },
      {
        $lookup: {
          from: 'users',
          localField: 'preacher',
          foreignField: '_id',
          as: 'preacher'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator'
        }
      },
      { $unwind: { path: '$preacher', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } }
    ]);
  }

  private async getPersonalizedBites(query: object): Promise<any[]> {
    return SermonBite.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'preacher',
          foreignField: '_id',
          as: 'preacher'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator'
        }
      },
      { $unwind: { path: '$preacher', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
      { $sort: { engagementScore: -1 } },
      { $limit: this.BATCH_SIZE }
    ]);
  }

  private shuffleAndDeduplicate(bites: any[], limit: number): any[] {
    const seen = new Set();
    const creators = new Map<string, number>();
    const result = [];

    // Fisher-Yates shuffle
    for (let i = bites.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bites[i], bites[j]] = [bites[j], bites[i]];
    }

    // Deduplicate and apply creator cap
    for (const bite of bites) {
      const biteId = bite._id.toString();
      const creatorId = bite.creator?._id?.toString();

      if (!seen.has(biteId) && 
          (!creatorId || 
           !creators.has(creatorId) || 
           creators.get(creatorId)! < this.CREATOR_CAP_PER_BATCH)) {
        
        seen.add(biteId);
        if (creatorId) {
          creators.set(creatorId, (creators.get(creatorId) || 0) + 1);
        }
        result.push(bite);

        if (result.length === limit) break;
      }
    }

    return result;
  }

  public async updateUserPreferences(
    userId: ObjectId,
    preferences: {
      categories?: string[];
      preachers?: ObjectId[];
      interactionType?: string;
      biteId?: ObjectId;
    }
  ): Promise<IResult> {
    try {
      let userPref = await UserPreference.findOne({ user: userId });
      
      if (!userPref) {
        userPref = await UserPreference.create({
          user: userId,
          categories: preferences.categories || [],
          preferredPreachers: preferences.preachers || []
        });
      } else {
        if (preferences.categories) {
          userPref.categories = preferences.categories;
        }
        if (preferences.preachers) {
          userPref.preferredPreachers = preferences.preachers;
        }
        await userPref.save();
      }

      // Record interaction if provided
      if (preferences.interactionType && preferences.biteId) {
        await UserInteraction.create({
          user: userId,
          bite: preferences.biteId,
          type: preferences.interactionType,
          timestamp: new Date()
        });
      }

      return {
        error: false,
        message: 'Preferences updated successfully',
        code: 200,
        data: { preferences: userPref }
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message,
        code: 500,
        data: null
      };
    }
  }
 
}

export default new FeedService();