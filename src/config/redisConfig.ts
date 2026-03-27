import  { Redis } from"ioredis";
import { Queue } from "bullmq";
import loggers from "./logger";
import { io } from "../server";
import AppError from "../utils/AppError";

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

    this.instance.on('connect',() => loggers.info('✅ Connected to Redis server'));
    this.instance.on('error',(error) => {loggers.error('❌ Redis connection error:',error)
        throw new AppError('Redis Connection Error',500,false);
    });
      
     return this.instance;

    }

    static getQueueClient (){
        if(!this.dataQueue){
            this.dataQueue = new Queue("dataQueue",{
                connection:this.getredisClient(),
                defaultJobOptions :{
                    removeOnComplete:10,
                    removeOnFail:5
                }
                
            })
        }

         return this.dataQueue
    }
}

class RedisService {
    private redisClient: Redis;

    constructor() {
        this.redisClient = RedisConfig.getredisClient();
    }

    async addtofifolist(key:string,value:String){
        try {
            await this.redisClient.lpush(key as any,value as any);
            await this.redisClient.ltrim(key as any,0,100);

            const list = await this.getfifolist(key);
            io.emit('fifoupdate',{key,list});
        } catch (error) {
            this.redisClient.del(key as any);
            loggers.error('Error adding to FIFO list:', error);
        }
    }

    async getfifolist(key:string){
        try{
            return await this.redisClient.lrange(key,0,-1);
             
             
        }catch(error:any){
            loggers.error('Error fetching FIFO list:', error);
            throw new AppError('Error fetching FIFO list',500,false);
        }
    }

    
}

let redisClient = RedisConfig.getredisClient();
let queueClient = RedisConfig.getQueueClient();
let redisService = new RedisService();
export {redisClient,queueClient,redisService};