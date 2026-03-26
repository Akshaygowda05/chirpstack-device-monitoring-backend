import http from 'http';
import { Server } from "socket.io";
import { app } from './server';




export const server = http.createServer(app);
 export const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})


