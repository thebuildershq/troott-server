import mongoose, { Schema, Model } from "mongoose";
import { IRoleDoc } from "../utils/interface.util";
import slugify from "slugify";
import { EDbModels, EUserType } from "../utils/enums.util";

const RoleSchema = new mongoose.Schema<IRoleDoc>(
  {
    name: {
      type: String,
      required: [true, "please add a role name"],
      default: EUserType.USER,
      enum: Object.values(EUserType),
      unique: true,
    },
    description: {
      type: String,
      required: [true, "please add a role description"],
      maxlength: [400, "role description cannot be more than 400 characters"],
    },
    slug: { type: String, default: "" },

    permissions: [{ type: String, ref: EDbModels.PERMISSION }],
    users: [
      {
        type: Schema.Types.Mixed,
        ref: EDbModels.USER,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: "_version",
    toJSON: {
      transform(doc: any, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);


RoleSchema.set("toJSON", { virtuals: true, getters: true });

RoleSchema.pre<IRoleDoc>("save", async function (next) {
  this.slug = slugify(this.name, { lower: true, replacement: "-" });

  next();
});

RoleSchema.pre<IRoleDoc>("insertMany", async function (next) {
  this.slug = slugify(this.name, { lower: true, replacement: "-" });
  next();
});

RoleSchema.methods.getAll = async () => {
  return await Role.find({});
};

RoleSchema.methods.findByName = async (name: string) => {
  const role = await Role.findOne({ name: name });
  return role ? role : null;
};

const Role: Model<IRoleDoc> = mongoose.model<IRoleDoc>(
  EDbModels.ROLE,
  RoleSchema
);
export default Role;
