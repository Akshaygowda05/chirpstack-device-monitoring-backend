import { StatusCodes } from "http-status-codes";
import { Request,Response } from "express";
import AppError from "../utils/AppError";
import { homeService } from "../services/home.service";
import { ReportRepository } from "../repositories/home.repository";

const service = new homeService(new ReportRepository() )

export class homeController{
    async getPannlesData(req:Request,res:Response){
        const applicationId = req.applicationId;

        if(!applicationId){
            throw new AppError("seesion expried please login!",StatusCodes.BAD_REQUEST)
        }


        const last5day = await service.getPannelsData(applicationId);
        const today = await service.getTodayPanels(applicationId)

        res.status(StatusCodes.OK).json({
            message:'success',
            data:{last5day,today}
        })


    }

    async getDeviceActiveInactiveCount(req:Request,res:Response){
        const applicationId = req.applicationId;

        if(!applicationId){
            throw new AppError("seesion expried please login!",StatusCodes.BAD_REQUEST)
        }

        const last5day = await service.getActiveCount(applicationId);
       //// console.log("🚀 ~ file: home.controller.ts:84 ~ homeController ~ getDeviceActiveInactiveCount ~ last5day:", last5day)
        const today = await service.getTodayActiveCount(applicationId)
       // console.log("🚀 ~ file: home.controller.ts:87 ~ homeController ~ getDeviceActiveInactiveCount ~ today:", today)

        res.status(StatusCodes.OK).json({
            message:'success',
            data:{last5day,today}
        })
    }

    // async getAvgbatteryDischarge(req:Request,res:Response){
    //     const applicationId = req.applicationId;

    //     if(!applicationId){
    //         throw new AppError("session expired please login again",StatusCodes.BAD_REQUEST
    //         )
    //     }

    //     const last5days = await service.getAvgDischarge(applicationId);
    //     const todayData = await service.getTodayPanels(applicationId);

    //     res.status(StatusCodes.OK).json({
    //         message:'success',
    //         data:{last5days,todayData}
    //     })

        
    // }
}