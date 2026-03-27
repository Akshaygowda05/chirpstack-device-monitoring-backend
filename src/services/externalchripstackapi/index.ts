
import express, { NextFunction, Request, Response } from 'express';
import apiClient from '../../config/apiclient';
import authenticate from '../../middlewares/auth.middlware';
import loggers from '../../config/logger';
import { prisma } from '../../config/primsaConfig';
import AppError from '../../utils/AppError';
import { StatusCodes } from 'http-status-codes';
const  chripstackRouter = express.Router();
require('dotenv').config();



// this is to get devices by group id 
chripstackRouter.get('/devices/:groupId',authenticate ,async (req: Request, res: Response,next: NextFunction) => {
    const { groupId } = req.params;
    try {
        const applicationId = req.applicationId;
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
        res.json({ result: response.data.result }); 
    } catch (error) {
        const err: any = error;
        loggers.error('API Error:', err.response?.data || err.message);
        next(err); // Pass the error to the global error handler
    }
});


// fetch the devices list
chripstackRouter.get('/devices', authenticate, async (req: Request, res: Response,next: NextFunction) => {
    try {
        const applicationId = req.applicationId;
        if(!applicationId){
            throw new AppError('Application ID missing in user token,please login again',StatusCodes.BAD_REQUEST);
        }
         const response = await apiClient.get('/api/devices', {
            params: {
                limit: req.query.limit || 1000,
                applicationId: applicationId
            }   
        });
        res.json({ result: response.data.result });
    } catch (err) {
        const error: any = err;
        loggers.error('API Error:', error.response?.data || error.message);
        next(error); // Pass the error to the global error handler
    }
});


// toggle downlink for device(for this authneticate we dont want )
chripstackRouter.post('/devices/:deviceId/queue', async (req: Request, res: Response,next: NextFunction) => {
    try {
        const { deviceId } = req.params;
        const response = await apiClient.post(
            `/api/devices/${deviceId}/queue`,
            req.body
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
    const applicationId = req.applicationId;
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

        const applicationId = req.applicationId;
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
chripstackRouter.post('/multicast-groups/:groupId/queue', async (req:Request, res:Response,next: NextFunction) => {
    try {
        const { groupId } = req.params;
        const { data } = req.body;
        const response = await apiClient.post(
            `/api/multicast-groups/${groupId}/queue`,
            {
                queueItem: {
                    data: data,
                    fPort: 1
                }
            }
        );
        (async () => {
            try {
               // await triggermulticastGroup([groupId], req.body);   wait for the same trigger to complete
            } catch (err:any) {
                console.error("Background trigger error:", err.message);
            }
        })();

        // 3. Respond immediately (do not wait for trigger)
        res.json({
            multicastResponse: response.data,
        });

    } catch (error: any) {
        loggers.error('API Error:', error.response?.data || error.message);
     next(error); // Pass the error to the global error handler
    }
});



export default chripstackRouter;




