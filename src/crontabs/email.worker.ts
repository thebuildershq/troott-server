import { Worker } from "bullmq";
import Redis from "ioredis";
import { REDIS_CONFIG } from "../config/redis.config";
import EmailService from "../services/email.service";
import { IEmailJob } from "../utils/interface.util";
import IORedis from "ioredis";

const redis = new IORedis(REDIS_CONFIG);
const emailService = EmailService;

export const emailWorker = new Worker<IEmailJob>(
  "email-queue",
  async (job) => {
    try {
      const jobData = job.data;

      const result = await emailService.sendEmail({
        driver: jobData.driver,
        user: jobData.user,
        template: jobData.template,
        code: jobData.code,
        metadata: jobData.metadata,
        options: jobData.options,
      });

      if (result.error) {
        throw new Error(result.message);
      }

      console.log(`[EmailWorker] Email sent to ${jobData.user.email}`);
    } catch (err) {
      console.error(`Email job failed for user ${job.data.user?.email}`, err);
      throw err;
    }
  },
  { connection: redis }
);

// Optional: log failed jobs
emailWorker.on("failed", (job, err) => {
  console.error(`Email Job Failed [${job?.id}]`, err);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down email worker...");
  await emailWorker.close();
  await redis.quit();
  process.exit(0);
});
