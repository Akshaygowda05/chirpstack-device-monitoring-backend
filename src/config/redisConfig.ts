import  { Redis } from"ioredis";
import { Queue } from "bullmq";

export class RedisConfig{
    private static instance:Redis | null = null;
    private static dataQueue :Queue | null = null;

    static getredisClient(){
    if(!this.instance){ 
        this.instance = new Redis ({
            host: process.env.REDIS_HOST || "localhost",
            port: Number(process.env.REDIS_PORT) || 6379,
            maxRetriesPerRequest: null,
        })
    }
      
        return this.instance;

    }

    static getQueueClient (){
        if(!this.dataQueue){
            this.dataQueue = new Queue("dataQueue",{
                connection:this.getredisClient(),
                defaultJobOptions :{
                    removeOnComplete:10,removeOnFail:5
                }
                
            })
        }

         return this.dataQueue
    }
}


let redisClient = RedisConfig.getredisClient();
let queueClient = RedisConfig.getQueueClient();

export {redisClient,queueClient};