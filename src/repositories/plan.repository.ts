import { Model } from "mongoose";
import Plan from "../models/Plan.model";
import { IResult, IPlanDoc } from "../utils/interface.util";

class PlanRepository {
  private model: Model<IPlanDoc>;

  constructor() {
    this.model = Plan;
  }

  /**
   * @name findById
   * @param id
   * @returns {Promise<IResult>}
   */
  public async findById(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const plan = await this.model.findById(id);
    if (!plan) {
      result.error = true;
      result.code = 404;
      result.message = "Plan not found";
    } else {
      result.data = plan;
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

    const plan = await this.model.findOne({ code }).lean();
    if (!plan) {
      result.error = true;
      result.code = 404;
      result.message = "Plan not found";
    } else {
      result.data = plan;
    }

    return result;
  }

  /**
   * @name getPlans
   * @param page
   * @param limit
   * @returns {Promise<IResult>}
   */
  public async getPlans(page: number = 1, limit: number = 10): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const plans = await this.model
      .find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    result.data = plans;

    return result;
  }

  /**
   * @name createPlan
   * @param planData
   * @returns {Promise<IResult>}
   */
  public async createPlan(planData: Partial<IPlanDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newPlan = await this.model.create(planData);
    result.data = newPlan;
    result.message = "Plan created successfully";

    return result;
  }

  /**
   * @name updatePlan
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updatePlan(id: string, updateData: Partial<IPlanDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedPlan = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPlan) {
      result.error = true;
      result.code = 404;
      result.message = "Plan not found";
    } else {
      result.message = "Plan updated successfully";
      result.data = updatedPlan;
    }

    return result;
  }

  /**
   * @name deletePlan
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deletePlan(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedPlan = await this.model.findByIdAndDelete(id);
    if (!deletedPlan) {
      result.error = true;
      result.code = 404;
      result.message = "Plan not found";
    } else {
      result.message = "Plan deleted successfully";
      result.data = deletedPlan;
    }

    return result;
  }

  /**
   * @name getPlansByUser
   * @param userId
   * @returns {Promise<IResult>}
   */
  public async getPlansByUser(userId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const plans = await this.model.find({ user: userId }).lean();
    result.data = plans;

    return result;
  }

  /**
   * @name searchByName
   * @param name
   * @returns {Promise<IResult>}
   */
  public async searchByName(name: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const plans = await this.model.find({ name: new RegExp(name, "i") }).lean();
    result.data = plans;

    return result;
  }

  /**
   * @name togglePlanStatus
   * @param id
   * @param isEnabled
   * @returns {Promise<IResult>}
   */
  public async togglePlanStatus(id: string, isEnabled: boolean): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedPlan = await this.model.findByIdAndUpdate(id, { isEnabled }, { new: true });
    if (!updatedPlan) {
      result.error = true;
      result.code = 404;
      result.message = "Plan not found";
    } else {
      result.message = `Plan ${isEnabled ? "enabled" : "disabled"} successfully`;
      result.data = updatedPlan;
    }

    return result;
  }
}

export default new PlanRepository();
