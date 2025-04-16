import { Model } from "mongoose";
import Subscription from "../models/Subscription.model";
import { IResult, ISubscriptionDoc } from "../utils/interface.util";

class SubscriptionRepository {
  private model: Model<ISubscriptionDoc>;

  constructor() {
    this.model = Subscription;
  }

  /**
   * @name findById
   * @param id
   * @returns {Promise<IResult>}
   */
  public async findById(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const subscription = await this.model.findById(id).populate(["user", "plan", "transactions"]);
    if (!subscription) {
      result.error = true;
      result.code = 404;
      result.message = "Subscription not found";
    } else {
      result.data = subscription;
    }

    return result;
  }

  /**
   * @name findByCode
   * @param code
   * @returns {Promise<IResult>}
   */
  public async findByCode(code: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const subscription = await this.model.findOne({ code }).populate(["user", "plan", "transactions"]).lean();
    if (!subscription) {
      result.error = true;
      result.code = 404;
      result.message = "Subscription not found";
    } else {
      result.data = subscription;
    }

    return result;
  }

  /**
   * @name getSubscriptions
   * @param page
   * @param limit
   * @returns {Promise<IResult>}
   */
  public async getSubscriptions(page: number = 1, limit: number = 10): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const subscriptions = await this.model
      .find({})
      .populate(["user", "plan", "transactions"])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    result.data = subscriptions;

    return result;
  }

  /**
   * @name createSubscription
   * @param subscriptionData
   * @returns {Promise<IResult>}
   */
  public async createSubscription(subscriptionData: Partial<ISubscriptionDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newSubscription = await this.model.create(subscriptionData);
    result.data = newSubscription;
    result.message = "Subscription created successfully";

    return result;
  }

  /**
   * @name updateSubscription
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateSubscription(id: string, updateData: Partial<ISubscriptionDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedSubscription = await this.model.findByIdAndUpdate(id, updateData, { new: true }).populate(["user", "plan", "transactions"]);
    if (!updatedSubscription) {
      result.error = true;
      result.code = 404;
      result.message = "Subscription not found";
    } else {
      result.message = "Subscription updated successfully";
      result.data = updatedSubscription;
    }

    return result;
  }

  /**
   * @name deleteSubscription
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deleteSubscription(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedSubscription = await this.model.findByIdAndDelete(id);
    if (!deletedSubscription) {
      result.error = true;
      result.code = 404;
      result.message = "Subscription not found";
    } else {
      result.message = "Subscription deleted successfully";
      result.data = deletedSubscription;
    }

    return result;
  }

  /**
   * @name getUserSubscriptions
   * @param userId
   * @returns {Promise<IResult>}
   */
  public async getUserSubscriptions(userId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const subscriptions = await this.model.find({ user: userId }).populate(["plan", "transactions"]).lean();
    result.data = subscriptions;

    return result;
  }

  /**
   * @name getSubscriptionsByPlan
   * @param planId
   * @returns {Promise<IResult>}
   */
  public async getSubscriptionsByPlan(planId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const subscriptions = await this.model.find({ plan: planId }).populate(["user", "transactions"]).lean();
    result.data = subscriptions;

    return result;
  }

  /**
   * @name updatePaymentStatus
   * @param id
   * @param isPaid
   * @returns {Promise<IResult>}
   */
  public async updatePaymentStatus(id: string, isPaid: boolean): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedSubscription = await this.model.findByIdAndUpdate(id, { isPaid }, { new: true });
    if (!updatedSubscription) {
      result.error = true;
      result.code = 404;
      result.message = "Subscription not found";
    } else {
      result.message = "Subscription payment status updated";
      result.data = updatedSubscription;
    }

    return result;
  }
}

export default new SubscriptionRepository();
