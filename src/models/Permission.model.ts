import mongoose, { Model, Schema } from "mongoose";
import { IPermissionDoc } from "../utils/interface.util";
import { DbModels } from "../utils/enums.util";

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
      required: [true, "please add a role description"],
    },
  },
  {
    timestamps: true,
    versionKey: "_version",
    optimisticConcurrency: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);


PermissionSchema.set("toJSON", {virtuals: true, getters: true})

PermissionSchema.pre<IPermissionDoc>("save", async function (next) {
  this.action = this.action;
  next();
});

PermissionSchema.pre<IPermissionDoc>("insertMany", async function (next) {
  this.action = this.action;
  next(); 
});

const Permission: Model<IPermissionDoc> = mongoose.model<IPermissionDoc>(
  DbModels.PERMISSION,
  PermissionSchema
);
  
export default Permission;
  

