import express from "express";
import authenticate from "../middlewares/auth.middlware";
import ReportforHomePage from "../repositories/homePage";


const homeRouter = express.Router();

// this  last 5 days data 
homeRouter.get(
    '/v1/panels-data',
    authenticate,ReportforHomePage.getPanelsData
   

)
