// bite controller



import { Request, Response, NextFunction } from 'express';
import FeedService from '../services/feed.service';
import asyncHandler from '../middlewares/async.mdw';
import ErrorResponse from '../utils/error.util';

export const getNewUserFeed = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    
    const result = await FeedService.generateNewUserFeed(userId, page);
    if (result.error) {
      return next(new ErrorResponse('Error', result.code!, [result.message]));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: 'Feed retrieved successfully',
      status: 200
    });
  }
);

export const getReturningUserFeed = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    
    const result = await FeedService.generatePersonalizedFeed(userId, page);
    if (result.error) {
      return next(new ErrorResponse('Error', result.code!, [result.message]));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: 'Personalized feed retrieved successfully',
      status: 200
    });
  }
);


// feed controller

    // get feed for new user
        // get trending bites
        // get new release (weekly)
        // get recently added (monthly)
        // get most recently played (by users) - popular
        // get favourite preachers bites (randomly) - the lsit
        // get bites based on user interests

    // get feed for returning user
        // get trending bites
        // get new release (weekly)
        // get recently added (monthly)
        // get most recently played (by users) - popular
        // get favourite preachers bites (randomly) - the list
        // get bites based on user interests

        // Recommendations
        // get user's watch history (completed, skipped, liked, disliked).
        // get user’s interactions (comments, shares, saves).
        // get user’s following list (creators, preachers).
        




        
    // upload sermon bite
        // create sermon bite metadata
        // get sermon bite metadata
        // update sermon bite metadata
        // delete sermon bite metadata
    // publish sermon bite
    // edit sermon bite
    // delete sermon bite
    // get all sermon bite
    // get a sermon bite + metadata
    // share a sermon bite
   
    // save a sermon bite
        // add to default library playlit
        // add to count 

    // unsave a sermon bite
        // remove to default library playlit
        // remove from count 