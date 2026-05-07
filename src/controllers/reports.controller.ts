import { Request, Response } from "express";
import { reportService } from "../services/reports.service";
import loggers from "../config/logger";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";


// this is for the particular group
class reportController {
    async getdataByRange(req: Request, res: Response) {
        try {
            const applicationId = (req as any).applicationId;
            let  { startDate, endDate, multicast } = req.query;

            if (!startDate || !multicast) {
                throw new AppError("Missing required query parameters", StatusCodes.BAD_REQUEST);
            }

       const startDateObj = new Date(startDate as string);
 
        const endDateObj = endDate
    ? new Date(endDate as string)
    : new Date(startDate as string);


if (
    isNaN(startDateObj.getTime()) ||
    isNaN(endDateObj.getTime())
) {
    return res.status(400).json({
        error: "Invalid date format"
    });
}


if (startDateObj > endDateObj) {
    return res.status(400).json({
        error: "startDate cannot be greater than endDate"
    });
}


startDateObj.setHours(0, 0, 0, 0);
endDateObj.setHours(23, 59, 59, 999);

            const report = await reportService.getReportWithDateRange(
                applicationId,
                startDateObj,
                endDateObj,
                multicast as string
            );
            res.json(report);
        } catch (error) {
            loggers.error("Error fetching monthly report for robot", error);
            throw error;
    }
}

async getTotalRobots(req: Request, res: Response) {
    try {

        const applicationId = (req as any).applicationId;
        let { startDate, endDate } = req.query;

        if(!startDate || !endDate) {
            throw new AppError("Missing required query parameters", StatusCodes.BAD_REQUEST);
        }

       const startDateObj = new Date(startDate as string);
    
       const endDateObj = endDate
    ? new Date(endDate as string)
    : new Date(startDate as string);


if (
    isNaN(startDateObj.getTime()) ||
    isNaN(endDateObj.getTime())
) {
    return res.status(400).json({
        error: "Invalid date format"
    });
}


if (startDateObj > endDateObj) {
    return res.status(400).json({
        error: "startDate cannot be greater than endDate"
    });
}


startDateObj.setHours(0, 0, 0, 0);
endDateObj.setHours(23, 59, 59, 999);

        const totalRobots = await reportService.getTotalPanelsCleaned(
            applicationId,
            startDateObj,
            endDateObj
        );
        res.json({ totalRobots });
    } catch (error) {
        loggers.error("Error fetching total robots", error);
        throw error;
    }
}
   

}

export const reportControllerInstance = new reportController();