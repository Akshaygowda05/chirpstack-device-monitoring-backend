import express,{Request,Response,NextFunction} from "express";
 
import http from 'http';
import { Server } from "socket.io";
import { MQTTconfig } from "./config/mqtt.Config";
import  "./services/queue.worker";
import { globalErrorHandler } from "./utils/globalErrorHandler";
import router from "./routes";
import envconfig from "./config/envConfig";
import { syncChirpstackData } from "./seed/applicationAndTenantId.repo";

const port = 3000;

export const app = express();
export const server = http.createServer(app);
 export const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})

console.log("Starting server...");
app.use(express.json());
syncChirpstackData();




new MQTTconfig()

app.use('/',router);

app.use(globalErrorHandler); // Register the global error handler

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
