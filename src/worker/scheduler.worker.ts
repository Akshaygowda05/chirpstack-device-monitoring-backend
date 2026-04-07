// workers/scheduler.worker.ts
import { Worker } from "bullmq";
import envconfig from "../config/envConfig";

const worker = new Worker(
  "schedulerQueue",
  async (job) => {
    console.log("🔥 Running scheduled job:", job.name);
    console.log("📦 Data:", job.data);

    // 👉 THIS is where your real logic goes
    // Example:
    // - Send command to devices
    // - Call ChirpStack API
    // - Process data
  },
  {
    connection: {
      host: envconfig.getRedisHost(),
      port: Number(envconfig.getRedisPort()),
    },
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err);
});