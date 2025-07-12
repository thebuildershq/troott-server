import mongoose, { ConnectOptions } from "mongoose";
import { ENVType } from "../utils/enums.util";
import colors from "colors";

const options: ConnectOptions = {
  autoIndex: true,
  maxIdleTimeMS: 1000,
  wtimeoutMS: 6000,
  connectTimeoutMS: 6000,
  socketTimeoutMS: 6000,
  serverSelectionTimeoutMS: 6000,
  family: 4,
};

const connectDB = async () => {
  let dataBaseURI: string | undefined;

  if (process.env.NODE_ENV === ENVType.PRODUCTION) {
    dataBaseURI = process.env.MONGODB_URI as string;
  } else if (process.env.NODE_ENV === ENVType.STAGING) {
    dataBaseURI = process.env.MONGODB_STAGING_URI as string;
  } else if (process.env.NODE_ENV === ENVType.DEVELOPMENT) {
    dataBaseURI = process.env.MONGODB_STAGING_URI as string;
  }

  if (!dataBaseURI) {
    throw new Error("Database URI is not defined for the current environment.");
  }

  try {
    const dbConn = await mongoose.connect(dataBaseURI as string, options);
    console.log(
      colors.cyan.bold.underline(
        `troott database ${process.env.NODE_ENV?.toUpperCase()} connected: ${dbConn.connection.host}`
      )
    );
  } catch (error) {
    console.log(
      colors.cyan.bold.underline(
        `Could not connect to troott database: ${error}`
      )
    );
    process.exit(1);
  }
};

export default connectDB;
