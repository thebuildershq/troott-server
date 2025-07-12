import mongoose, { Schema, Model } from "mongoose";
import { ILibraryDoc } from "../utils/interface.util";
import { DbModels } from "../utils/enums.util";

const LibrarySchema = new Schema<ILibraryDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: DbModels.USER, required: true, index: true },
    likedSermons: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON, default: [], index: true }],
    savedBtes: [{ type: Schema.Types.ObjectId, ref: DbModels.BITE,  default: [], index: true }],
    playlists: [{ type: Schema.Types.ObjectId, ref: DbModels.PLAYLIST, index: true }],
    favouritePreachers: [{ type: Schema.Types.ObjectId, ref: DbModels.PREACHER, index: true }],
    mostPlayed: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }], 
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
  DbModels.LIBRARY,
  LibrarySchema
);

export default Library;
