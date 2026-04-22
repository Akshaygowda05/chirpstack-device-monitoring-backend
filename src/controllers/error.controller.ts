import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import { getAllErrors, getCriticalDevices, getWarningDevices } from "../services/error.service";

class errorController {
    async getErrors(req:Request, res:Response) {
        const applicationId = req.applicationId;

        if (!applicationId) {
            throw new AppError("Application ID is required", StatusCodes.BAD_REQUEST);
        }

        const result = await getAllErrors(applicationId);

        res.status(StatusCodes.OK).json({
            success: true,
            data: result
        })
    }


    async getWarningDevices(req:Request, res:Response) {
        const applicationId = req.applicationId;

        if (!applicationId) {
            throw new AppError("Application ID is required", StatusCodes.BAD_REQUEST);
        }

        const result = await getWarningDevices(applicationId);

        res.status(StatusCodes.OK).json({
            success: true,
            data: result
        })

    }


    async getCriticalDevices(req:Request, res:Response) {
        const applicationId = req.applicationId;

        if (!applicationId) {
            throw new AppError("Application ID is required", StatusCodes.BAD_REQUEST);
        }

        const result = await getCriticalDevices(applicationId);

        res.status(StatusCodes.OK).json({
            success: true,
            data: result
        })
    }
}


export default new errorController();