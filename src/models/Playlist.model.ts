import mongoose, { Schema, Model } from "mongoose";
import { IPlaylistDoc } from "../utils/interface.util";
import { EDbModels, EPlaylistType } from "../utils/enums.util";

const PlaylistSchema = new Schema<IPlaylistDoc>(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, maxLength: 1000 },
    playlistCover: { type: String },
    totalDuration: { type: String, required: true },
    isCollaborative: { type: Boolean, default: false, index: true },
    isPublic: { type: Boolean, default: true, index: true },
    likes: { type: Number, default: 0, index: true },

    playlistType: {
      type: String,
      enum: Object.values(EPlaylistType),
      required: true,
      index: true,
    },
    items: [
      {
        itemId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
      },
    ],

    // Relationships
    user: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.USER,
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.USER,
      required: true,
      index: true,
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

const Playlist: Model<IPlaylistDoc> = mongoose.model<IPlaylistDoc>(
  EDbModels.PLAYLIST,
  PlaylistSchema
);

export default Playlist;
