import mongoose, { Model, Schema } from "mongoose";
import { IPermissionDoc } from "../utils/interface.util";
import { EDbModels } from "../utils/enums.util";

const PermissionSchema = new Schema<IPermissionDoc>(
  {
    action: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: "_version",
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);

const Permission: Model<IPermissionDoc> = mongoose.model<IPermissionDoc>(
    EDbModels.PERMISSION,
    PermissionSchema
  );
  
export default Permission;
  

