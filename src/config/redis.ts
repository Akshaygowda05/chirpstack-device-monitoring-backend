import { Redis } from "ioredis";
import loggers from "./logger";
import envconfig from "./envConfig";


let redis: Redis;

export const getRedisClient = () => {
  if (!redis) {
    redis = new Redis({
      host: String(envconfig.getRedisHost()) || "localhost",
      port: Number(envconfig.getRedisPort()) || 6379,
      maxRetriesPerRequest: null,

    });

    redis.on("connect", () => {
      loggers.info("✅ Redis connected");
    });

    redis.on("ready", () => {
    loggers.info("✅ Redis READY (fully connected)");
    });

    redis.on("error", (err) => {
      loggers.error("❌ Redis error:", err);
    });
  }

  return redis;
};