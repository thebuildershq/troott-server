import { Model } from "mongoose";
import Transaction from "../models/Transaction.model";
import { IResult, ITransactionDoc } from "../utils/interface.util";

class TransactionRepository {
  private model: Model<ITransactionDoc>;

  constructor() {
    this.model = Transaction;
  }

  /**
   * @name findById
   * @param id
   * @returns {Promise<IResult>}
   */
  public async findById(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const transaction = await this.model.findById(id);
    if (!transaction) {
      result.error = true;
      result.code = 404;
      result.message = "Transaction not found";
    } else {
      result.data = transaction;
    }

    return result;
  }

  /**
   * @name findByReference
   * @param reference
   * @returns {Promise<IResult>}
   */
  public async findByReference(reference: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const transaction = await this.model.findOne({ reference }).lean();
    if (!transaction) {
      result.error = true;
      result.code = 404;
      result.message = "Transaction not found";
    } else {
      result.data = transaction;
    }

    return result;
  }

  /**
   * @name getTransactions
   * @returns {Promise<IResult>}
   */
  public async getTransactions(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const transactions = await this.model.find({}).lean();
    result.data = transactions;

    return result;
  }

  /**
   * @name createTransaction
   * @param transactionData
   * @returns {Promise<IResult>}
   */
  public async createTransaction(transactionData: Partial<ITransactionDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newTransaction = await this.model.create(transactionData);
    result.data = newTransaction;
    result.message = "Transaction created successfully";

    return result;
  }

  /**
   * @name updateTransaction
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateTransaction(id: string, updateData: Partial<ITransactionDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedTransaction = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedTransaction) {
      result.error = true;
      result.code = 404;
      result.message = "Transaction not found";
    } else {
      result.message = "Transaction updated successfully";
      result.data = updatedTransaction;
    }

    return result;
  }

  /**
   * @name deleteTransaction
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deleteTransaction(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedTransaction = await this.model.findByIdAndDelete(id);
    if (!deletedTransaction) {
      result.error = true;
      result.code = 404;
      result.message = "Transaction not found";
    } else {
      result.message = "Transaction deleted successfully";
      result.data = deletedTransaction;
    }

    return result;
  }

  /**
   * @name getTransactionsByUser
   * @param userId
   * @returns {Promise<IResult>}
   */
  public async getTransactionsByUser(userId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const transactions = await this.model.find({ user: userId }).lean();
    result.data = transactions;

    return result;
  }

  /**
   * @name getTransactionsByStatus
   * @param status
   * @returns {Promise<IResult>}
   */
  public async getTransactionsByStatus(status: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const transactions = await this.model.find({ status }).lean();
    result.data = transactions;

    return result;
  }

  /**
   * @name getTransactionsByType
   * @param type
   * @returns {Promise<IResult>}
   */
  public async getTransactionsByType(type: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const transactions = await this.model.find({ type }).lean();
    result.data = transactions;

    return result;
  }
}

export default new TransactionRepository();
