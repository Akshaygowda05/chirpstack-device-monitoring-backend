

import { prisma } from "../config/primsaConfig";

   interface AverageBatteryDischarge {
      date: string;
      avgDischarge: number;
    }

export class ReportRepository {

  async getLast5DaysPanels(applicationId: string) {
    return prisma.$queryRaw<any[]>`
      SELECT DATE("createdAt") as date,
             SUM("panelsCleaned")::int as "totalCleaned"
      FROM "RobotData"
      WHERE "applicationId" = ${applicationId}
        AND "createdAt" >= CURRENT_DATE - INTERVAL '5 days'
        AND "createdAt" < CURRENT_DATE
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") DESC
    `;
  }

  async getTodayPanels(applicationId: string) {
    return prisma.$queryRaw<any[]>`
      SELECT DATE("createdAt") as date,
             SUM("panelsCleaned")::int as "totalCleaned"
      FROM "RobotData"
      WHERE "applicationId" = ${applicationId}
        AND "createdAt" >= CURRENT_DATE
        AND "createdAt" < CURRENT_DATE + INTERVAL '1 day'
      GROUP BY DATE("createdAt")
    `;
  }

  async getAvgDischarge(applicationId:string){
    return prisma.$queryRaw<AverageBatteryDischarge[]>`
        SELECT 
          DATE("createdAt") as date,
          AVG("batteryDischargeCycle") as "avgDischarge"
        FROM "RobotData"
        WHERE "applicationId" = ${applicationId}
          AND "createdAt" >= CURRENT_DATE - INTERVAL '5 days'
          AND "createdAt" < CURRENT_DATE
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt") DESC
      `;
  }

  async getTodayDicharge(applicatonId:string){
    return prisma.$queryRaw<AverageBatteryDischarge[]>`
        SELECT 
          DATE("createdAt") as date,
          AVG(batteryDischargeCycle) as "avgDischarge"
        FROM "RobotData"
        WHERE "applicationId" = ${applicatonId}
          AND "createdAt" >= CURRENT_DATE
        GROUP BY DATE("createdAt")
      `;
  }

  // this is for the something of last 5 days online count

async getDeviceActiveCount(applicationId: string) {
  return prisma.$queryRaw`
    SELECT * FROM "activeDeviceCount"
    WHERE "applicationId" = ${applicationId}
      AND "createdAt" >= CURRENT_DATE - INTERVAL '5 days'
  `
}





}