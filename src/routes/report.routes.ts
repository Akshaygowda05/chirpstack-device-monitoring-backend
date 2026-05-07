import express  from "express";
import { reportControllerInstance } from "../controllers/reports.controller";
import authenticate from "../middlewares/auth.middlware";


const reportRouter =  express.Router();


reportRouter.get("/reports/data",authenticate,reportControllerInstance.getdataByRange);
reportRouter.get("/reports/total-panels-cleaned",authenticate,reportControllerInstance.getTotalRobots);

export default reportRouter;