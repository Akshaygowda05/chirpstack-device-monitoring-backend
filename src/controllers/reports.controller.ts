import { Request, Response } from "express";
import { reportService } from "../services/reports.service";

class reportController {
    async getMonthlyReportForRobot(req: Request, res: Response) {
        try {
            const applicationId = (req as any).applicationId;
            const { startDate, endDate, multicast } = req.query;

            if (!startDate || !endDate || !multicast) {
                return res.status(400).json({ error: "Missing required query parameters" });
            }

            const report = await reportService.getReportWithDateRange(
                applicationId,
                new Date(startDate as string),
                new Date(endDate as string),
                multicast as string
            );
            res.json(report);
        } catch (error) {
            // Handle errors
        }
    }

    async 
}