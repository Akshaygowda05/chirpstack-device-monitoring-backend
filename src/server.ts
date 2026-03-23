import express from "express";
import { MQTTconfig } from "./config/mqtt.Config";
import  "./services/queue.worker";
const app = express();
const port = 3000;

app.use(express.json());
new MQTTconfig()



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})