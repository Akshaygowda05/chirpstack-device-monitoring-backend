import express, { NextFunction,Request,Response } from "express";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import apiClient from "../config/apiclient";
import authenticate from "../middlewares/auth.middlware";
import { app } from "../server";

const robotsBatteriesRouter = express.Router();



robotsBatteriesRouter.get(`/v1/batteries/:groupId`,authenticate,async(req:Request,res:Response,next:NextFunction) =>{
    try {
        const {groupId} = req.params;
        const applicationId = req.applicationId;

        if(!applicationId){
            throw new AppError('Application ID missing in user token,please login again',StatusCodes.BAD_REQUEST);
        }

        if(!groupId){
            throw new AppError('Group ID is required',StatusCodes.BAD_REQUEST);
        }

        const devices = await apiClient.get('/api/devices', {
            params:{
                groupId: groupId,
                applicationId: applicationId,
                multicastGroupId: groupId
            }
        })

     console.log("Devices fetched from Chirpstack API:", devices); // Debug log to check the response structure
        if(!devices || !devices.data || !devices.data.result) {
            throw new AppError(`No devices found for group ID ${groupId}`,StatusCodes.NOT_FOUND);
        }


        res.json({ batteries: devices.data.result });


    } catch (error) {
        next(error);
    }
})

export default robotsBatteriesRouter;