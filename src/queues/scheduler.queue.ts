import { Queue } from "bullmq";
import envconfig from "../config/envConfig";

export const schedulerQueue = new Queue("schedulerQueue", {
  connection: {
    host: envconfig.getRedisHost(),
    port: envconfig.getRedisPort(),
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});