import app from "./config/app.config";
import colors from "colors";
import connectDB from "./config/db.config";
import seedData from "./config/seeds/seeder.seed";

const connect = async () : Promise<void> => {

    await connectDB()
    await seedData()
}

connect()


const PORT = process.env.PORT || 5015;
 

const server = app.listen(PORT, () => {
    console.log(colors.bold.yellow (`troott server running in ${process.env.NODE_ENV} mode`)) ;
})

process.on('unhandledRejection', (err:any, promise) => {
    console.log(colors.bold.red(`Error: ${err.message}`))
    server.close(() => process.exit(1))
})