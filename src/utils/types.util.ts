import { EDbModels } from "./enums.util";
import {
  IAudioMetadata,
  IDocumentMetadata,
  IImageMetadata,
  IVideoMetadata,
} from "./interface.util";

export type EmailDriver =
  | "sendgrid"
  | "aws"
  | "mailtrap"
  | "mailgun"
  | "mailSend";

export type VerifyOTPType =
  | "register"
  | "password-reset"
  | "change-password"
  | "login"
  | "verify";

export type IUploadMetadata =
  | IAudioMetadata
  | IImageMetadata
  | IVideoMetadata
  | IDocumentMetadata;

export type LinkedModel =
  | EDbModels.SERMON
  | EDbModels.USER
  | EDbModels.PLAYLIST;
