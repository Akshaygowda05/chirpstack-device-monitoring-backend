import { prisma } from "../config/primsaConfig";

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


    async updateSiteConfig(applicationId: string, configData:any){
        const updatedConfig = await prisma.siteConfiguration.upsert({
            where: { applicationId },
            update:{
                ...configData.panelsGap !== undefined && { panelsGap: configData.panelsGap },
                ...configData.panelWidth !== undefined && { panelWidth: configData.panelWidth },
                ...configData.multiplicationFactor !== undefined && { multiplicationFactor: configData.multiplicationFactor },
                ...configData.triggeringAction !== undefined && { triggeringAction: configData.triggeringAction },
                ...configData.sendTwiceAday !== undefined && { sendTwiceAday: configData.sendTwiceAday },
            },create:{
                applicationId,
                ...configData.panelsGap !== undefined && { panelsGap: configData.panelsGap },
                ...configData.panelWidth !== undefined && { panelWidth: configData.panelWidth },
                ...configData.multiplicationFactor !== undefined && { multiplicationFactor: configData.multiplicationFactor },
                ...configData.triggeringAction !== undefined && { triggeringAction: configData.triggeringAction },
                ...configData.sendTwiceAday !== undefined && { sendTwiceAday: configData.sendTwiceAday },
            }
        })
        return updatedConfig;
    }

}


export const  siteConfigService = new siteConfiguration();