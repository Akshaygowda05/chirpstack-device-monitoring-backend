import { stat } from "node:fs";
import { prisma } from "../config/primsaConfig";
import { getRedisClient } from "../config/redis";

let redis = getRedisClient();

class siteConfiguration {

    async getSiteConfig(applicationId: string) {
        const config = await prisma.siteConfiguration.findFirst({
            where: { applicationId },
            select:{
                panelsGap: true,
                panelWidth: true,
                multiplicationFactor:true,
                triggeringAction: true,
                sendTwiceAday: true

            }
        })
        return config;
    }


    async updateSiteConfig(applicationId: string, configData: any) {

   
    const data: any = {};

    if (configData.panelsGap !== undefined)
        data.panelsGap = configData.panelsGap;

    if (configData.panelWidth !== undefined)
        data.panelWidth = configData.panelWidth;

    if (configData.multiplicationFactor !== undefined)
        data.multiplicationFactor = configData.multiplicationFactor;

    if (configData.triggeringAction !== undefined)
        data.triggeringAction = configData.triggeringAction;

    if (configData.sendTwiceAday !== undefined)
        data.sendTwiceAday = configData.sendTwiceAday;

 
    data.isConfigured = true;

    const updatedConfig = await prisma.siteConfiguration.upsert({
        where: { applicationId },
        update: data,
        create: {
            applicationId,
            ...data
        }
    });


    await redis.del(`siteConfig:${applicationId}`);

    return updatedConfig;
}




async getStatus(applicationId: string) {
    const config = await prisma.siteConfiguration.findFirst({
        where: { applicationId },
    })

    if (!config) {
        return { 

            exits:false,
         status: "not configured"
        };
    }

    return{
        exits:true,
        status: config.isConfigured ? "configured" : "not configured"
    }
}

}


export const  siteConfigService = new siteConfiguration();