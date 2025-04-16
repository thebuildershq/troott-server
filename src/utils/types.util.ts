import { Types, Document, ObjectId, Date } from "mongoose";

export type EmailDriver = "sendgrid" | "aws" | "mailtrap";
export type VerifyOTPType =
  | "register"
  | "password-reset"
  | "change-password"
  | "login"
  | "verify";