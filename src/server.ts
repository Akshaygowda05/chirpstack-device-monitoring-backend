import express,{Request,Response,NextFunction} from "express";
 
import http from 'http';
import { Server } from "socket.io";
import { MQTTconfig } from "./config/mqtt.Config";
import  "./worker/queue.worker";
import { globalErrorHandler } from "./utils/globalErrorHandler";
import router from "./routes";
import cors from "cors";
import { activeInactiveJobs } from "./backgroungJobs/ActiveInactive";
import loggers from "./config/logger";
import  jwt  from "jsonwebtoken";
import envconfig from "./config/envConfig";
import { getApplicationEvents } from "./config/redis";
import authenticate from "./middlewares/auth.middlware";

const port = 3000;

export const app = express();
export const server = http.createServer(app);
 export const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})




app.use(cors());
app.use(express.json()); // this is to parse the incoming request body as JSON
app.use(express.urlencoded({ extended: true }));

console.log("Starting server...");


io.on("connection", (socket) => {
  try {
    const token = socket.handshake.auth?.token;

    const decoded = jwt.verify(
      token,
      envconfig.getTokenSecret()
    ) as { applicationId: string };

    const applicationId = decoded.applicationId;

    socket.join(applicationId);

    loggers.info(
      `✅ Client connected: ${socket.id} joined ${applicationId}`
    );

    socket.on("disconnect", () => {
      loggers.info("❌ Client disconnected", socket.id);
    });

  } catch (err) {
    loggers.warn("❌ Invalid socket token", socket.id);
    socket.disconnect(); 
  }
});

const mqttInstance= new MQTTconfig()
activeInactiveJobs()

app.use('/',router);
app.get('/api/health', (req, res) => {
  res.json({
    mqtt:mqttInstance.getMqttHealth ,
    status: 'OK'
  });
});


app.get(`/api/events`,authenticate,async(req:Request,res:Response)=>{

  const applicationId = (req as any).applicationId;
  if(!applicationId){
    return res.status(400).json({error:"Application ID is required"})
  }
  const events = await getApplicationEvents(applicationId);
  res.json(events);
})

app.use(globalErrorHandler); 

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
