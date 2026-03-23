import { Worker } from "bullmq";
import { redisClient } from "../config/redisConfig";


const  worker = new Worker("dataQueue",async (job) =>{  // here we can give any name to the worker,i have given "dataQueue" and job is the job object
    const {topic,payload} = job.data;
    
    console.log(`Payload: ${payload}`);
},{
    connection:redisClient
})

worker.on('completed',(job) => {
    console.log(`Job with id ${job.id} has been completed`);
})

worker.on('failed',(job,err) => {
    console.log(`Job with id ${job?.id} has failed with error ${err.message}`);
})

export default worker;