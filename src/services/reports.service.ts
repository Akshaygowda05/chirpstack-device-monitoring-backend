// this for the report service
// 5 thing which is very important for the report
// 1......current day report
// 2.....based on the date range report
// 3.....in monthly detail report  ---particular robot performance in the month
// 4......total module cleaned based on the time he has selected
// 5......totalRobotRunned ,in that auto and manual both the robot runned in that particular time frame

import apiClient from "../config/apiclient";
import { prisma } from "../config/primsaConfig";
import AppError from "../utils/AppError";
import statusCode from "http-status-codes";


// first we will try to current data  so




class ReportService {

    // here i need to ge the data based on the time i have selected
async getReportWithDateRange(applicationId: string, startDate: Date, endDate: Date, multicast: string) {
    const limit = 1000;
    let offset = 0;
    const finalReport: Record<string, any> = {};
    let totalPanelsCleaned = 0;

    while (true) {
        const response = await apiClient.get(`/api/devices`, {
            params: { applicationId, multicastGroupId: multicast, limit, offset }
        });

        const devices = response.data.result;

     
        if (!devices || devices.length === 0) break;

        const devEuis = devices.map((d: any) => d.devEui);
        const reportData = await prisma.robotData.groupBy({
            by: ["deviceId"],
            where: {
                deviceId: { in: devEuis },
                createdAt: { gte: startDate, lte: endDate }
            },
            _sum: { panelsCleaned: true }
        });

        totalPanelsCleaned += reportData.reduce((sum, item) => sum + (item._sum.panelsCleaned ?? 0), 0);

 
        const statsLookup = new Map(
            reportData.map(item => [item.deviceId, item._sum.panelsCleaned ?? 0])
        );

      
        for (const device of devices) {
            finalReport[device.devEui] = {
                deviceName: device.name, 
                totalPanelsCleaned: statsLookup.get(device.devEui) || 0,
                location:device.description || "unknown"
            };
        }

       
        offset += limit;
    }

    return { ...finalReport, totalPanelsCleaned };
}

// this is for the totalpannel cleaned 
async getTotalPanelsCleaned( applicationId: string, startDate: Date, endDate: Date) {
    try {
       
const result = await prisma.$queryRaw<{
    totalPanelsCleaned: number | null;
    totalRobots: number;
}[]>`
SELECT
SUM("panelsCleaned")::integer AS "totalPanelsCleaned",
COUNT(DISTINCT "deviceId")::integer AS "totalRobots"
FROM "RobotData"
WHERE "applicationId" = ${applicationId}
AND "createdAt" >= ${startDate}
AND "createdAt" <= ${endDate};
`

return result[0];
       
    } catch (error) {
        console.error("Error occurred while fetching total panels cleaned:", error);
        throw error;
    }
    
}
// this for to the montly report individaul rbot data 
async monthlyReportforRobot(applicationId: string, month: number, year: number,multicast: string) {
    try {
        const date = new Date()

        const statartOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);

        const devices = await apiClient.get(`/api/devices`, {
            params: { applicationId, multicastGroupId: multicast }
        });

        const devEuis = devices.data.result.map((d: any) => d.devEui);

        const rawdata = await prisma.robotData.findMany({
            where:{
                deviceId: { in: devEuis },
                createdAt: { gte: statartOfMonth, lte: endOfMonth }
            },select:{
                deviceId:true,
                panelsCleaned:true,
                createdAt:true
            }
        })

        const robotReport: Record<string, any> = {};

        for(const data of rawdata){
            if(!robotReport[data.deviceId]){
                robotReport[data.deviceId] = {
                    totalPanelsCleaned: 0,
                    dailyData: []
                }
            }
        }
    } catch (error) {
        throw new AppError("Failed to fetch monthly report for robot", statusCode.INTERNAL_SERVER_ERROR);
    }
}



}

export const reportService = new ReportService();