import { redisClient } from "../config/redisConfig";
import { ReportRepository } from "../repositories/home.repository";
import { fillMissingDates } from "../utils/date.util";

export class homeService{
    constructor (private repo :ReportRepository){}

    async getPannelsData(applicationId:string){
        const cachekey = `${applicationId}_pannelsData`;

        const cached = await redisClient.get(cachekey)

        if(cached){
            return JSON.parse(cached)
        }

        let pannelData = await this.repo.getLast5DaysPanels(applicationId);

        pannelData = fillMissingDates(pannelData,5,"totalCleaned")

        await redisClient.set(cachekey,JSON.stringify(pannelData), "EX",3600);

        return pannelData
    }

    async getTodayPanels(applicationId: string) {
    const result = await this.repo.getTodayPanels(applicationId);
    return result[0] || { date: new Date(), totalCleaned: 0 };
  }



  async getAvgDischarge(applicationId:string){
    const cacheKey = `${applicationId}_AvgDischarge`;

    const cached = await redisClient.get(cacheKey);

    if(cached) {return JSON.parse(cached)}

    let avgDischage = await this.repo.getAvgDischarge(applicationId)
    avgDischage = fillMissingDates(avgDischage,5,'AvgDischarge')

    await redisClient.set(cacheKey,JSON.stringify(avgDischage),"EX",3600)

    return avgDischage
  }


  // this will work on later
//   async getTodayAvrageDsicharge(applicationid:string){
//     const result = await this.repo.getTodayDicharge(applicationid)

//     return result[0];

//   } 
  
//   async getActiveCount(applicationId:string){
//     let cachekey = `${applicationId}_activeDeviceCount`

//     const cached = await redisClient.get(cachekey);

//     if(cached){
//         return JSON.parse(cached)
//     }

//     let activeData = await this.repo.getDeviceActiveCount(applicationId)
//       activeData = fillMissingDates(activeData,5,"devicesCount")
//   }
}