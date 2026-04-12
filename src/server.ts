import express,{Request,Response,NextFunction} from "express";
 
import http from 'http';
import { Server } from "socket.io";
import { MQTTconfig } from "./config/mqtt.Config";
import  "./worker/queue.worker";
import { globalErrorHandler } from "./utils/globalErrorHandler";
import router from "./routes";
import cors from "cors";

const port = 3000;

export const app = express();
export const server = http.createServer(app);
 export const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})

const mqttInstance= new MQTTconfig()


app.use(cors());
app.use(express.json()); // this is to parse the incoming request body as JSON
app.use(express.urlencoded({ extended: true }));

console.log("Starting server...");





new MQTTconfig()

app.use('/',router);
app.get('/api/health', (req, res) => {
  res.json({
    mqtt:mqttInstance.getMqttHealth ,
    status: 'OK'
  });
});

app.use(globalErrorHandler); 

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
