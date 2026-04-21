
import { getRedisClient } from "../config/redis";

const redis = getRedisClient();

export const getAllErrors = async (applicationId: string) => {
    const appKey = `applicationError:${applicationId}`;

    const errorData = await redis.hgetall(appKey);

    const result = Object.entries(errorData).map(([deviceId, data]) => {
        try {
            const parsed = JSON.parse(data);
            return {
                deviceId,
                deviceName: parsed.deviceName,
                errorLevel: parsed.errorLevel,
                timestamp: parsed.timestamp
            };

        } catch (error) {
            return null;
        }
    }).filter((item): item is NonNullable<typeof item> => item !== null);


    return result;
}


export const getWarningDevices = async (applicationId: string) => {
    const warningSet = `applicationWarning:${applicationId}`;
    return redis.smembers(warningSet);
}

export const getCriticalDevices = async (applicationId: string) => {
    const criticalSet = `applicationCritical:${applicationId}`;
    return redis.smembers(criticalSet);
}