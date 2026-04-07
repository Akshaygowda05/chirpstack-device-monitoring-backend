
import { Queue } from "bullmq";
import envconfig from "../config/envConfig";

export const dataQueue = new Queue("dataQueue", {
  connection: {
    host: envconfig.getRedisHost(),
    port: envconfig.getRedisPort(),
  },
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 20,
  },
});