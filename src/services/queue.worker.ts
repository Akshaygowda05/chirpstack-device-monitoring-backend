import { Worker } from "bullmq";
import { redisClient } from "../config/redisConfig";
import loggers from "../config/logger";
import { validateZeroOrNot } from "../utils/robotdata.parse";


const  worker = new Worker("dataQueue",async (job) =>{  // here we can give any name to the worker,i have given "dataQueue" and job is the job object
    const {topic,payload} = job.data;

    const parsedPayload = JSON.parse(payload);

    const validateData  =  await validateZeroOrNot(parsedPayload);

    if(validateData){
        loggers.warn(`Received MQTT message with all zero values on topic ${topic}, skipping processing.`);
        return;
     }

     try{
         // here first i need to save the data 
            loggers.info(`Processing MQTT message on topic ${topic} with payload: ${payload}`);
     }catch(error){
            loggers.error('Error processing MQTT message:', error);

     }

     
    }

    





    
    
},{
    connection:redisClient,
    concurrency:10
})

worker.on('completed',(job) => {
    //loggers.info(`Job with id ${job.id} has been completed`);
})

worker.on('failed',(job,err) => {
   // loggers.error(`Job with id ${job?.id} has failed with error ${err.message}`);
})

export default worker;