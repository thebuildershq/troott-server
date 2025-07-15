import { Queue } from "bullmq";
import { REDIS_CONFIG } from "../config/redis.config";
import { IEmailJob } from "../utils/interface.util";
import Redis from "ioredis";

const redis = new Redis(REDIS_CONFIG);

export const emailQueue = new Queue<IEmailJob>("email-queue", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const addEmailToQueue = async (data: IEmailJob) => {
  await emailQueue.add("send-email", data);
};
