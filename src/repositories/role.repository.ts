import { Model } from "mongoose";
import Role from "../models/Role.model";
import { IResult, IRoleDoc } from "../utils/interface.util";

class RoleRepository {
  private model: Model<IRoleDoc>;

  constructor() {
    this.model = Role;
  }

  /**
   * @name findById
   * @param id
   * @returns {Promise<IResult>}
   */
  public async findById(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const role = await this.model.findById(id);
    if (!role) {
      result.error = true;
      result.code = 404;
      result.message = "Role not found";
    } else {
      result.data = role;
    }

    return result;
  }

  /**
   * @name findByName
   * @param name
   * @returns {Promise<IResult>}
   */
  public async findByName(name: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const role = await this.model.findOne({ name }).lean();
    if (!role) {
      result.error = true;
      result.code = 404;
      result.message = "Role not found";
    } else {
      result.data = role;
    }

    return result;
  }

  /**
   * @name findBySlug
   * @param slug
   * @returns {Promise<IResult>}
   */
  public async findBySlug(slug: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const role = await this.model.findOne({ slug }).lean();
    if (!role) {
      result.error = true;
      result.code = 404;
      result.message = "Role not found";
    } else {
      result.data = role;
    }

    return result;
  }

  /**
   * @name getRoles
   * @returns {Promise<IResult>}
   */
  public async getRoles(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const roles = await this.model.find({}).lean();
    result.data = roles;

    return result;
  }

  /**
   * @name createRole
   * @param roleData
   * @returns {Promise<IResult>}
   */
  public async createRole(roleData: Partial<IRoleDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newRole = await this.model.create(roleData);
    result.data = newRole;
    result.message = "Role created successfully";

    return result;
  }

  /**
   * @name updateRole
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateRole(id: string, updateData: Partial<IRoleDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedRole = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedRole) {
      result.error = true;
      result.code = 404;
      result.message = "Role not found";
    } else {
      result.message = "Role updated successfully";
      result.data = updatedRole;
    }

    return result;
  }

  /**
   * @name deleteRole
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deleteRole(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedRole = await this.model.findByIdAndDelete(id);
    if (!deletedRole) {
      result.error = true;
      result.code = 404;
      result.message = "Role not found";
    } else {
      result.message = "Role deleted successfully";
      result.data = deletedRole;
    }

    return result;
  }

  /**
   * @name getRolesByPermissions
   * @param permissions
   * @returns {Promise<IResult>}
   */
  public async getRolesByPermissions(permissions: string[]): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const roles = await this.model.find({ permissions: { $in: permissions } }).lean();
    result.data = roles;

    return result;
  }
}

export default new RoleRepository();
