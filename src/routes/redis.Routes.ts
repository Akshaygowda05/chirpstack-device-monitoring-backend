import express, {Request,Response, NextFunction } from "express";
import { redisClient } from "../config/redisConfig";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";

const fetchRedisDataRouter = express.Router();



fetchRedisDataRouter.get('/v1/device/:deviceEui/data',async(req:Request,res:Response,next:NextFunction) =>{
    try {
        const { deviceEui } = req.params;
        if(!deviceEui){
            throw new AppError('Device EUI is required',StatusCodes.BAD_REQUEST);
        }

        const data = await redisClient.hgetall(`device:${deviceEui}`);

        if(!data){
            throw new AppError(`No data found for device with EUI ${deviceEui}`,StatusCodes.NOT_FOUND);
        }

        res.json(data);

    } catch (error) {
        next(error);
    }
})

export default fetchRedisDataRouter;

