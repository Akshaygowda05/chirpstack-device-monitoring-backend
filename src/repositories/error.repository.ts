import { getRedisClient } from "../config/redis";

const redis = getRedisClient();

// 1 = warning, 2 = critical
const errorDetail: Record<number, number> = {
  2: 1,
  10: 2,
  11: 2,
  12: 2,
  13: 1,
  14: 1,
  16: 1,
  17: 2,
  18: 2,
};

export async function ErrorRedisServices(data: any) {
  try {
    const errorRaw = data?.object?.CH7;
    const applicationId = data?.deviceInfo?.applicationId;
    const deviceName = data?.deviceInfo?.deviceName;
    const deviceId = data?.deviceInfo?.devEui;

    if (!applicationId || !deviceId) {
      console.warn("Missing applicationId or deviceId");
      return;
    }

    if (errorRaw === undefined || errorRaw === null) {
      console.warn("Missing CH7");
      return;
    }

    const appKey = `applicationError:${applicationId}`;
    const warningSet = `applicationWarning:${applicationId}`;
    const criticalSet = `applicationCritical:${applicationId}`;
    const pubChannel = `errorChannel:${applicationId}`;

    const levelToSetMap: Record<number, string> = {
      1: warningSet,
      2: criticalSet,
    };

   
    const oldData = await redis.hget(appKey, deviceId);

    let oldErrorCode = 0;
    let oldErrorLevel = 0;

    if (oldData) {
      try {
        const parsed = JSON.parse(oldData);
        oldErrorCode = parsed.errorCode ?? 0;
        oldErrorLevel = parsed.errorLevel ?? 0;
      } catch (e) {
        console.warn("Bad Redis payload", e);
      }
    }

  
    if (errorRaw == 0 || errorRaw == "0") {

      const multi = redis.multi();

      // remove from whichever set it was in
      const oldSet = levelToSetMap[oldErrorLevel];
      if (oldSet) {
        multi.srem(oldSet, deviceId);
      }

      multi.hdel(appKey, deviceId);

      multi.publish(
        pubChannel,
        JSON.stringify({
          type: "cleared",
          deviceId,
          deviceName,
          errorCode: 0,
          errorLevel: 0,
          timestamp: Date.now(),
        })
      );

      await multi.exec();

      //console.log(`Cleared error for ${deviceId}`);
      return;
    }

   
    const errorCode = parseInt(errorRaw);

    if (Number.isNaN(errorCode)) {
    //  console.warn("Invalid error code:", errorRaw);
      return;
    }

    const errorLevel = errorDetail[errorCode] ?? 1;

 
    if (
      oldErrorCode === errorCode &&
      oldErrorLevel === errorLevel
    ) {
     // console.log("No change, skipping update");
      return;
    }

    const multi = redis.multi();

    // remove from previous severity set
    const oldSet = levelToSetMap[oldErrorLevel];
    if (oldSet) {
      multi.srem(oldSet, deviceId);
    }

    const newSet = levelToSetMap[errorLevel];
    if (newSet) {
      multi.sadd(newSet, deviceId);
    }

    const newData = JSON.stringify({
      deviceName,
      errorCode,
      errorLevel,
      timestamp: Date.now(),
    });

    multi.hset(appKey, deviceId, newData);

    multi.expire(appKey, 3600);
    multi.expire(warningSet, 3600);
    multi.expire(criticalSet, 3600);

    multi.publish(
      pubChannel,
      JSON.stringify({
        type: "updated",
        deviceId,
        deviceName,
        errorCode,
        errorLevel,
        timestamp: Date.now(),
      })
    );

    await multi.exec();

    console.log(
      `Updated ${deviceId} -> code ${errorCode}, level ${errorLevel}`
    );

  } catch (err) {
    console.error("❌ ErrorRedisServices failed:", err);
  }
}