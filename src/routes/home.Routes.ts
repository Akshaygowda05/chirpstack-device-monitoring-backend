import express from "express";
import authenticate from "../middlewares/auth.middlware";
import { homeController } from "../controllers/home.controller";



const homeRouter = express.Router();

homeRouter.get('/home/pannels-data',authenticate,homeController.prototype.getPannlesData)
homeRouter.get('/home/active-inactive-count',authenticate,homeController.prototype.getDeviceActiveInactiveCount)

// this  last 5 days data 

export default homeRouter;
