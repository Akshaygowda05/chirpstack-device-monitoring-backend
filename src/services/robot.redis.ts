import { getRedisClient } from "../config/redis";

let redisClient = getRedisClient();

export async function storeDataInRedis(data:any){

   // console.log("Storing data in Redis: i am here what to ");
    try {

        const redisData : Record<string,string> = {};
        const deviceEui = data?.deviceInfo?.devEui;
        if(!deviceEui){
            throw new Error("devEui is missing in payload");
        }
  // thing what are the thing you want to store in redis
  //1. key : deviceEui
  //2 value as all CH's value 
  //3 ressi and snr 
        let objectData = data?.object // this is already a object 
        let rssi = data.rxInfo[0]?.rssi; // i need to add this in redis and also snr value
        let snr = data.rxInfo[0]?.snr;


        for (const key in objectData) {
            if(Object.prototype.hasOwnProperty.call(objectData, key)){
                redisData[key] = String(objectData[key]);
            }
        }

        if (rssi !== undefined) {
            redisData.rssi = String(rssi);
        }
        if (snr !== undefined) {
            redisData.snr = String(snr);
        }

        redisData["updatedAt"] = new Date().toISOString();

          await redisClient.hset(`device:${deviceEui}`, redisData); // this will merge the existing data

    //    if(redisSet){
    //     console.log(`Data stored in Redis for device ${deviceEui}`);
    //    }
         await redisClient.expire(`device:${deviceEui}`, 1800); // Expire after 30 min


       // console.log("this is what i need to check wheather proper data is comng or not ",objectData)
       // await redisClient.set(deviceEui,JSON.stringify(data));
    } catch (error) {
        throw new Error("Error storing data in Redis: " + (error as Error).message);
    }
}