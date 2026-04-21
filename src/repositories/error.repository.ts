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
    const errorRaw = data.object?.CH7;
    const applicationId = data.deviceInfo?.applicationId;
    const deviceName = data.deviceInfo?.deviceName;
    const deviceId = data.deviceInfo?.deviceId;

    if (!applicationId || !deviceId) return;

    const appKey = `applicationError:${applicationId}`;
    const warningSet = `applicationWarning:${applicationId}`;
    const criticalSet = `applicationCritical:${applicationId}`;
    const pubChannel = `errorChannel:${applicationId}`;

    // get previous state
    const oldData = await redis.hget(appKey, deviceId);
    let oldErrorLevel = 0;

    // first old data idre remove madi amle error level na parse madbeku and then new data idre add madi publish madbeku so that frontend can update the ui accordingly
    if (oldData) {
      try {
        oldErrorLevel = JSON.parse(oldData).errorLevel ?? 0;
      } catch {}
    }
 
    const multi = redis.multi();


    if (errorRaw == 0 || errorRaw == "0") {
      multi.srem(warningSet, deviceId);
      multi.srem(criticalSet, deviceId);

    
      multi.hdel(appKey, deviceId);

    
      multi.publish(
        pubChannel,
        JSON.stringify({
          deviceId,
          deviceName,
          cleared: true,
          timestamp: Date.now(),
        })
      );

      await multi.exec();
      return;
    }

    const errorCode = parseInt(errorRaw);
    const errorLevel = errorDetail[errorCode] ?? 1; 

    const newData = JSON.stringify({
      deviceName,
      errorCode,
      errorLevel,
      timestamp: Date.now(),
    });


    const levelToSetMap: Record<number, string> = {
      1: warningSet,
      2: criticalSet,
    };

    const allSets = Object.values(levelToSetMap);
    const targetSet = levelToSetMap[errorLevel] 

    if(targetSet){
    multi.sadd(targetSet, deviceId);
    }
    
    allSets.forEach((set) => {
      multi.srem(set, deviceId);
    });

  



    multi.hset(appKey, deviceId, newData);

   
    multi.expire(appKey, 3600);
    multi.expire(warningSet, 3600);
    multi.expire(criticalSet, 3600);

    multi.publish(
      pubChannel,
      JSON.stringify({
        deviceId,
        deviceName,
        errorCode,
        errorLevel,
        timestamp: Date.now(),
      })
    );

    await multi.exec();
  } catch (err) {
    console.error("❌ ErrorRedisServices failed:", err);
  }
}