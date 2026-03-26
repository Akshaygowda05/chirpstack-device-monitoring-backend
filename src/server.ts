import express from "express";
import http from 'http';
import { Server } from "socket.io";
import { MQTTconfig } from "./config/mqtt.Config";
import  "./services/queue.worker";

const port = 3000;

export const app = express();
export const server = http.createServer(app);
 export const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})

app.use(express.json());



new MQTTconfig()

server.use((req,res,next)=>{
    
})


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
