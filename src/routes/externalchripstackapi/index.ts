
import express, { NextFunction, Request, Response } from 'express';
import apiClient from '../../config/apiclient';
import authenticate from '../../middlewares/auth.middlware';
import loggers from '../../config/logger';
import { prisma } from '../../config/primsaConfig';
import AppError from '../../utils/AppError';
import { StatusCodes } from 'http-status-codes';
import { server } from '../../server';
import { getRedisClient } from '../../config/redis';
import { HttpStatusCode } from 'axios';
const  chripstackRouter = express.Router();
require('dotenv').config();

const THIRTY_MINUTES = 30 * 60 * 1000; 

interface CustomRequest extends Request {
    applicationId?: string;
}

let redis = getRedisClient();


// this is to get devices by group id 
chripstackRouter.get('/v1/devices/:groupId',authenticate ,async (req: Request, res: Response,next: NextFunction) => {
    const { groupId } = req.params;
    try {
        const applicationId = (req as CustomRequest).applicationId;

        if(!applicationId){
           throw new AppError('Application ID missing in user token,please login again',StatusCodes.BAD_REQUEST);
        }
        const response = await apiClient.get('/api/devices', {
            params: {
                limit: Number(req.query.limit) || 1000,
                applicationId: applicationId,
                multicastGroupId: groupId
            }
        });
        res.json({ result: response.data }); 
    } catch (error) {
        const err: any = error;
        loggers.error('API Error:', err.response?.data || err.message);
        next(err); // Pass the error to the global error handler
    }
});


// fetch the devices list
chripstackRouter.get(
  "/devices",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const applicationId = (req as CustomRequest).applicationId;

      if (!applicationId) {
        throw new AppError(
          "Application ID missing in user token, please login again",
          StatusCodes.BAD_REQUEST
        );
      }

      const { limit = 10, offset = 0,search } = req.query;

      const response = await apiClient.get("/api/devices", {
        params: {
          limit,
          offset,
          applicationId,
          search
        },
      });

      const devices = response.data.result || [];

      if (devices.length === 0) {
        return res.status(HttpStatusCode.Ok).json({ result: [] });
      }

      const pipeline = redis.pipeline();

      devices.forEach((device: any) => {
        pipeline.hget(`device:${device.devEui}`, "CH5");
      });

      const pipelineResults = await pipeline.exec();

      

      const enrichedDevices = devices.map(
        (device: any, index: number) => {
          const batteryVoltage = pipelineResults?.[index]?.[1];

          const lastSeen = device?.lastSeenAt
            ? new Date(device.lastSeenAt)
            : null;
   //console.log("this is where i an missig it out i dont know what to do,",lastSeen)
          let isActive = "offline";

          if (lastSeen) {
            const timeDiff = Date.now() - lastSeen.getTime();
            isActive =
              timeDiff <= THIRTY_MINUTES ? "online" : "offline";
          }

          return {
            ...device,
            batteryVoltage: batteryVoltage ?? "0",
            isActive,
          };
        }
      );

      return res
        .status(HttpStatusCode.Ok)
        .json({ result: enrichedDevices });
    } catch (err) {
      const error: any = err;
      loggers.error("API Error:", error.response?.data || error.message);
      next(error);
    }
  }
);

// toggle downlink for device(for this authneticate we dont want )
chripstackRouter.post('/devices/:deviceId/queue', async (req: Request, res: Response,next: NextFunction) => {
    try {
        const { deviceId } = req.params;

        const now = new Date();
        const { data } = req.body;  // the data should be base64 formate
        const expiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString(); // after 30 min it has to expire
         
        const response = await apiClient.post(
            `/api/devices/${deviceId}/queue`,{
              queueItem: {
                data,
                fPort: 1,
                expiresAt,
                confirmed: true,

            }
        }
        );
        res.json(response.data);
        loggers.info(`Downlink queued for device ${deviceId}`);
    } catch (err) {
        const error: any = err;
       loggers.error(`Failed to toggle downlink for device ${req.params.deviceId}: ${error.response?.data || error.message}`);
        next(error); // Pass the error to the global error handler
    }
});

// fetch multicast groups by 
chripstackRouter.get('/multicast-groups', authenticate,async (req:Request, res:Response,next: NextFunction) => {
  try {
    const applicationId = (req as CustomRequest).applicationId;
    if(!applicationId){
        throw new AppError('Application ID missing in user token,please login again',StatusCodes.BAD_REQUEST);
    }
    const response = await apiClient.get('/api/multicast-groups', {
      params: {
        limit: req.query.limit || 100,
        applicationId: applicationId
      }
    });

    res.json(response.data);
    loggers.info('Fetched multicast groups successfully');
  } catch (err) {
    const error: any = err;
    loggers.error('API Error:', error.response?.data || error.message);
    next(error); // Pass the error to the global error handler
  }
});


// this is to get all gateways for perticular tenant
chripstackRouter.get('/allGateways',authenticate,async(req: Request,res: Response)=>{
    try {

        const applicationId = (req as CustomRequest).applicationId;
        if(!applicationId){
            throw new AppError('Application ID missing in user token,please login again',StatusCodes.BAD_REQUEST);
        }

        const teneantId = prisma.chirpstackApplication.findFirst({
            where:{
                chirpstackId: applicationId
            },select:{
                tenantId: true
            }
        })
        const gatewayResponse = await apiClient.get(`api/gateways`,{
            params:{
                limit:req.query.limit || 100,
                tenantId: (teneantId as any)?.tenantId
            }
        });
        const gatewayData = gatewayResponse.data;

        if(!gatewayData || !gatewayData.result || gatewayData.result.length === 0){
            throw new AppError('No gateways found for the tenant',StatusCodes.NOT_FOUND);
         }

        res.status(200).json({
            message:"success",
            gatewayData
        })

    } catch (err) {
        const error: any = err;
        res.status(500).json({
            error:"failed to fetch the gatways ",
            details:error.response?.data || error.message
        })
    }


})
// // i dont think so it is required or not but let it be
// chripstackRouter.get("internal/server", async(req, res) => {
//     try {
//         const response = await axios.get(envconfig.getChirpstackUrl());
//         if (response.status === 200) {
//             return res.status(200).json({
//                 time: Date.now().toString(),
//             });
//         }
//         return res.status(500).json({
//             message: "Notworking"
//         });
        
//     } catch (err) {
//         const error: any = err;
//         loggers.error('Server check error:', error.message);
//         return res.status(500).json({
//             error: error.message
//         });
//     }
// });

// if i fetch groups by user ,then i can send data to particualr group and all the devices in that group will get the data, so here we are sending data to group and then group will send to all the devices in that group
chripstackRouter.post('/multicast-groups/queue', async (req, res, next) => {
    try {
        const { groupId, data } = req.body;

        if (!groupId || (Array.isArray(groupId) && groupId.length === 0)) {
            throw new AppError('Group ID is required', StatusCodes.BAD_REQUEST);
        }

        if (!data) {
            throw new AppError('Data is required', StatusCodes.BAD_REQUEST);
        }

        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        const groupIdArray = Array.isArray(groupId) ? groupId : [groupId];

        const promises = groupIdArray.map((gId: string) => {
            return apiClient.post(`/api/multicast-groups/${gId}/queue`, {
                queueItem: {
                    data,
                    fPort: 1,
                    expiresAt,
                    confirmed: true,
                }
            })
            .then((response) => {
                const result = response.data;

                const isSuccess =
                    result?.multicastQueueItem?.fCnt !== undefined;

                server.emit("multicast-status", {
                    groupId: gId,
                    status: isSuccess ? "success" : "failed",
                    fCnt: result?.multicastQueueItem?.fCnt,
                });
            })
            .catch((error) => {
                server.emit("multicast-status", {
                    groupId: gId,
                    status: "failed",
                    reason: error.response?.data || error.message
                });
            });
        });

        await Promise.all(promises);

        res.status(200).json({
            success: true,
            message: "Multicast queued successfully"
        });

    } catch (error) {
        next(error);
    }
});

export default chripstackRouter;




