import mongoose, { Schema, Model } from "mongoose";
import { ILibraryDoc } from "../utils/interface.util";
import { EDbModels } from "../utils/enums.util";

const LibrarySchema = new Schema<ILibraryDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: EDbModels.USER, required: true, index: true },
    likedSermons: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON, index: true }],
    savedBtes: [{ type: Schema.Types.ObjectId, ref: EDbModels.BITE, index: true }],
    playlists: [{ type: Schema.Types.ObjectId, ref: EDbModels.PLAYLIST, index: true }],
    favouritePreachers: [{ type: Schema.Types.ObjectId, ref: EDbModels.PREACHER, index: true }],
    mostPlayed: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON }], 
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

const Library: Model<ILibraryDoc> = mongoose.model<ILibraryDoc>(
  EDbModels.LIBRARY,
  LibrarySchema
);

export default Library;
