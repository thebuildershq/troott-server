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
}

const connectDB = async () => {
    if (process.env.NODE_ENV ===ENVType.DEVELOPMENT || process.env.NODE_ENV === ENVType.PRODUCTION)
        try {
            
            const dbConn = await 

        mongoose.connect(process.env.MONGODB_URI || '', options)
            console.log(colors.cyan.bold.underline(`Database Connected: ${dbConn.connection.host} `))
        } catch (error) {
            console.log(colors.cyan.bold.underline(`Could not connect to database: ${error}`))
            process.exit(1)
        }
    }

export default connectDB;