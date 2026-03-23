import { Request, Response } from 'express';
import { prisma } from '../config/primsaConfig';
import { redisClient } from '../config/redisConfig';

export class ReportforHomePage {

// this is all only for the home and user who had login but admin it will be diffrent     
async getPanelsData(req: Request, res: Response) {
  try {
    const applicationId = req.applicationId;

    if (!applicationId) {
      return res.status(400).json({
        error: "Application ID missing in user token, please login again"
      });
    }

    const cacheKey = `${applicationId}_panelData`;

    interface PanelDataType {
      date: Date;
      totalCleaned: number;
    }

    let panelData: PanelDataType[];

    
    const redisPanelData = await redisClient.get(cacheKey);

    if (redisPanelData) {
      panelData = JSON.parse(redisPanelData);
    } else {
    
      panelData = await prisma.$queryRaw<PanelDataType[]>`
        SELECT DATE("createdAt") as date,
        SUM("panelsCleaned") as totalCleaned
        FROM "RobotData"
        WHERE "applicationId" = ${applicationId}
          AND "createdAt" >= CURRENT_DATE - INTERVAL '5 days'
          AND "createdAt" < CURRENT_DATE
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt") DESC
      `;

      
      const existingDates = panelData.map(
        (entry) => new Date(entry.date).toISOString().split("T")[0]
      );

      const today = new Date();

      for (let i = 1; i <= 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const dateString = date.toISOString().split("T")[0];

        if (!existingDates.includes(dateString)) {
          panelData.push({
            date: new Date(dateString),
            totalCleaned: 0
          });
        }
      }
        panelData.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      
      await redisClient.set(cacheKey, JSON.stringify(panelData), 'EX', 24 *60 * 60);
    }

   
    const todayPanelData = await prisma.$queryRaw<PanelDataType[]>`
      SELECT DATE("createdAt") as date,
      SUM("panelsCleaned") as totalCleaned
      FROM "RobotData"
      WHERE "applicationId" = ${applicationId}
        AND "createdAt" >= CURRENT_DATE
        AND "createdAt" < CURRENT_DATE + INTERVAL '1 day'
      GROUP BY DATE("createdAt")
    `;

    res.status(200).json({
      message: "success",
      data: {
        last5Days: panelData,
        today: todayPanelData[0] || { date: new Date(), totalCleaned: 0 }
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}


// for being it is not used 
async getAvgDichargeData(req: Request, res: Response) {
  try {
    const applicationId = req.applicationId;

    if (!applicationId) {
      return res.status(400).json({
        error: "Application ID missing in user token, please login again",
      });
    }

    interface AverageBatteryDischarge {
      date: string;
      avgDischarge: number;
    }

    let AvgDischarge: AverageBatteryDischarge[];

    const cacheKey = `${applicationId}_avgBatteryDischarge`;

    // ✅ Check Redis cache
    const redisAvgDischarge = await redisClient.get(cacheKey);

    if (redisAvgDischarge) {
      AvgDischarge = JSON.parse(redisAvgDischarge);
    } else {
    
      AvgDischarge = await prisma.$queryRaw<AverageBatteryDischarge[]>`
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

     
      const existingDates = AvgDischarge.map(
        (entry) => new Date(entry.date).toISOString().split("T")[0]
      );

      const today = new Date();

   
      for (let i = 1; i <= 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const dateString = date.toISOString().split("T")[0];

        if (!existingDates.includes(dateString)) {
          AvgDischarge.push({
            date: dateString,
            avgDischarge: 0,
          });
        }
      }

      
      AvgDischarge.sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

     
      await redisClient.set(
        cacheKey,
        JSON.stringify(AvgDischarge),
        "EX",
        24 * 60 * 60
      );
    }

    const todaysAverageDischarge =
      await prisma.$queryRaw<AverageBatteryDischarge[]>`
        SELECT 
          DATE("createdAt") as date,
          AVG(batteryDischargeCycle) as "avgDischarge"
        FROM "RobotData"
        WHERE "applicationId" = ${applicationId}
          AND "createdAt" >= CURRENT_DATE
        GROUP BY DATE("createdAt")
      `;

    // ✅ Response
    res.status(200).json({
      message: "success",
      data: {
        last5Days: AvgDischarge,
        today:
          todaysAverageDischarge.length > 0
            ? todaysAverageDischarge[0]
            : {
                date: new Date().toISOString().split("T")[0],
                avgDischarge: 0,
              },
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}

async getAverageBatteryDischargeCycle(req: Request, res: Response) {
    try {
        interface AverageBatteryDischarge {
            date: string;
            avgDischarge: number;
        }

        const applicationID = req.applicationId;

        if (!applicationID) {
            return res.status(404).json({ message: "Not found" });
        }

        const averageData: AverageBatteryDischarge[] = await prisma.$queryRaw<AverageBatteryDischarge[]>`
            SELECT DATE("createdAt") as date,
                   AVG("batteryDischargeCycle") as "avgDischarge"
            FROM "RobotData"
            WHERE "applicationId" = ${applicationID}
              AND "createdAt" >= CURRENT_DATE
        `;

        if (averageData.length > 0) {
            res.status(200).json({
                message: "success",
                data: averageData[0],
            });
        } else {
            res.status(200).json({
                message: "success",
                data: {
                    date: new Date().toISOString().split('T')[0],
                    avgDischarge: 0,
                },
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
}

// this is to get the how many were there online count

async getOnlineOfflineCount(req: Request, res: Response) {
  try {
    interface OnlineOfflineCount {
      date: string;
      onlineCount: number;
      offlineCount: number;
    }

    const applicationId = req.applicationId;

    if (!applicationId) {
      return res.status(400).json({
        error: "Application ID missing in user token, please login again",
      });
    }

    const OnlineOffline: OnlineOfflineCount[] = await prisma.$queryRaw<OnlineOfflineCount[]>`
      SELECT DATE("createdAt") as date,
             "activeCount" as "onlineCount",
             "inactiveCount" as "offlineCount"
      FROM "activeDeviceCount"
      WHERE "applicationId" = ${applicationId}
        AND "createdAt" >= CURRENT_DATE - INTERVAL '5 days'
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") DESC
    `;

    const missingData = OnlineOffline.map(entry => new Date(entry.date).toISOString().split('T')[0]);

    const today = new Date();

    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dataString = date.toISOString().split("T")[0];

      if (!missingData.includes(dataString)) {
        OnlineOffline.push({
          date: dataString,
          onlineCount: 0,
          offlineCount: 0
        });
      }
    }


    OnlineOffline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.status(200).json({
      message: "success",
      data: OnlineOffline
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}







}