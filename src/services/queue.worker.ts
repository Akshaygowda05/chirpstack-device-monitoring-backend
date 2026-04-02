import { Worker } from "bullmq";
import { redisClient } from "../config/redisConfig";
import loggers from "../config/logger";
import { validateZeroOrNot } from "../utils/robotdata.parse";
import { processMqttData } from "../controllers/mqttData.StateMachine";
import { storeDataInRedis } from "./robot.redis";


const  worker = new Worker("dataQueue",async (job) =>{  
    
    const {topic,payload} = job.data;

    const parsedPayload = JSON.parse(payload);

    const validateData  =  await validateZeroOrNot(parsedPayload);

    if(!validateData){

        try{ 

          await  Promise.all([
                // loggers.info(`Processing MQTT data for topic ${topic}`),
                processMqttData(topic, parsedPayload),
                storeDataInRedis(parsedPayload)

            ])
              

           

             } catch (error:any) {
            loggers.error(`Error processing MQTT data for topic ${topic}: ${error.message}`);
             return;}


    }else{
        loggers.warn(`Received MQTT message with all zero values on topic ${topic}, skipping processing.`);
    }
     
    }

,{
    connection:redisClient,
    concurrency:10
})

worker.on('completed',(job) => {
   // loggers.info(`Job with id ${job.id} has been completed`);
})

worker.on('failed',(job,err) => {
    loggers.error(`Job with id ${job?.id} has failed with error ${err.message}`);
})

export default worker;