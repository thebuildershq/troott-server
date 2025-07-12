import mongoose, { Schema, Model } from "mongoose";
import { ITransactionDoc } from "../utils/interface.util";
import { DbModels, TransactionsType } from "../utils/enums.util";
import { decrypt, encrypt } from "../utils/encryption.util";

const TransactionSchema = new Schema<ITransactionDoc>(
  {
    type: {
      type: String,
      enum: Object.values(TransactionsType),
      required: true,
      index: true,
    },
    medium: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    reference: { type: String, unique: true, required: true },
    currency: { type: String, required: true, index: true },
    providerRef: { type: String },
    providerName: { type: String },
    description: { type: String },
    narration: { type: String },
    amount: { type: Number, required: true },
    unitAmount: { type: Number, required: true }, // kobo unit * 100
    fee: { type: Number, required: true },
    unitFee: { type: Number, required: true }, // kobo unit * 100
    status: { type: String, required: true, index: true },
    reason: { type: String },
    message: { type: String },
    providerData: [{ type: Schema.Types.Mixed }],
    metadata: [{ type: Schema.Types.Mixed }],
    channel: { type: String },
    slug: { type: String, unique: true, required: true },
    card: {
      authCode: { type: String, select: false, required: true },
      cardBin: { type: String },
      cardLast: { type: String },
      expiryMonth: { type: String },
      expiryYear: { type: String },
      cardPan: { type: String, select: false, required: true },
      token: { type: String },
      provider: { type: String },
    },

    // Relationships
    user: {
      type: Schema.Types.ObjectId,
      ref: DbModels.USER,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: "_versions",
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);


TransactionSchema.pre<ITransactionDoc>("save", function (next) {
  if (this.card?.authCode) {
    this.card.authCode = encrypt(this.card.authCode);
  }
  if (this.card?.cardPan) {
    this.card.cardPan = encrypt(this.card.cardPan);
  }
  next();
});

TransactionSchema.methods.decryptCardDetails = function () {
  if (this.card) {
    return {
      ...this.card,
      authCode: decrypt(this.card.authCode),
      cardPan: decrypt(this.card.cardPan),
    };
  }
  return this.card;
};

// const transaction = await Transaction.findById(transactionId);
// const decryptedTransaction = {
//   ...transaction.toObject(),
//   card: transaction.decryptCardDetails(),
// };
// console.log(decryptedTransaction.card.authCode); // Decrypted value



const Transaction: Model<ITransactionDoc> = mongoose.model<ITransactionDoc>(
  DbModels.TRANSACTION,
  TransactionSchema
);

export default Transaction;
