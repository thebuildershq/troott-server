import app from "./config/app.config";
import colors from "colors";
import connectDB from "./config/db.config";
import seedData from "./config/seeds/seeder.seed";
import redisWrapper from "./middlewares/redis.mdw";
import { REDIS_CONFIG } from "./config/redis.config";


const PORT = process.env.PORT as string;

const connect = async (): Promise<void> => {
  await connectDB();
  await seedData();

  // Connect to Redis
  await redisWrapper.connect(REDIS_CONFIG);
};

connect();



const server = app.listen(PORT, () => {
  console.log(
    colors.bold.yellow(`troott server running in ${process.env.NODE_ENV} mode`)
  );
});

process.on("unhandledRejection", (err: any, promise) => {
  console.log(colors.bold.red(`Error: ${err.message}`));
  server.close(() => process.exit(1));
});

process.on("SIGINT", async () => {
  if (redisWrapper.client?.isOpen) {
    await redisWrapper.client.quit();
    console.log("🔌 Redis connection closed");
  }
  server.close(() => process.exit(0));
});