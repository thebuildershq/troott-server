import { DbModels } from "./enums.util";
import {
  IAudioMetadata,
  IDocumentMetadata,
  IImageMetadata,
  IVideoMetadata,
} from "./interface.util";


export type IUploadMetadata =
  | IAudioMetadata
  | IImageMetadata
  | IVideoMetadata
  | IDocumentMetadata;

export type LinkedModel =
  | DbModels.SERMON
  | DbModels.USER
  | DbModels.PLAYLIST;
