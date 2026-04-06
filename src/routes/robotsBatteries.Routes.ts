import express, { NextFunction,Request,Response } from "express";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import apiClient from "../config/apiclient";
import authenticate from "../middlewares/auth.middlware";
import { app } from "../server";
import { redisClient } from "../config/redisConfig";



const robotsBatteriesRouter = express.Router();


robotsBatteriesRouter.get(
  `/v1/batteries/:groupId`,
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { groupId } = req.params;
      const applicationId = req.applicationId;

      if (!applicationId) {
        throw new AppError(
          'Application ID missing in user token, please login again',
          StatusCodes.BAD_REQUEST
        );
      }

      if (!groupId) {
        throw new AppError('Group ID is required', StatusCodes.BAD_REQUEST);
      }

    
      const devicesResponse = await apiClient.get('/api/devices', {
        params: {
          limit: req.query.limit || 1000,
          applicationId,
          multicastGroupId: groupId,
        },
      });

      const devicesList = devicesResponse?.data?.result; // all device stored in array format ,ond kelsa bakki ide

      if (!devicesList || devicesList.length === 0) {
        throw new AppError(
          `No devices found for group ID ${groupId}`,
          StatusCodes.NOT_FOUND
        );
      }

    
      const pipeline = redisClient.pipeline();


      devicesList.forEach((device: any) => {
        pipeline.hget(`device:${device.devEui}`, 'CH5');
      });

     
      const results = await pipeline.exec();

      const batteries: Record<
        string,
        { batteryLevel: string; lastSeen: Date; name: string }
      > = {};

    
      if (results) {
        devicesList.forEach((device: any, index: number) => {
          const [error, batteryLevel] = results[index];

        if (error) {
          console.error(`Redis error for ${device.devEUI}`, error);
        }

          batteries[device.devEui] = {
            batteryLevel: String(batteryLevel) ?? "0",
            lastSeen: new Date(device.lastSeenAt),
            name: device.name,
          };
        });
      }
// this is done here

      return res.status(200).json({ groupId, batteries });

    } catch (error) {
      next(error);
    }
  }
);

export default robotsBatteriesRouter;