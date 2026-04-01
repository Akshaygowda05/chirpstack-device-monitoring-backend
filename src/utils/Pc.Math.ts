import { prisma } from "../config/primsaConfig";

export async function calculatePannelsCleand(applicationId:string,currentOdomter:number):Promise<number> {
    try {

        const getsiteconfig = await prisma.chirpstackApplication.findFirst({
            where:{
                chirpstackId: applicationId
            },include:{
                siteConfiguration:true
            }
        })

        if(!getsiteconfig || !getsiteconfig.siteConfiguration){
           // throw new Error('Site configuration not found for applicationId: ' + applicationId);
           return 0;
        }

        const distance = currentOdomter ;
        const effectiveCleaningWidth = getsiteconfig.siteConfiguration.panelsGap + getsiteconfig.siteConfiguration.panelWidth;
        const panelsCleaned = Math.floor(distance / effectiveCleaningWidth);
        const toalPannelsCleaned = panelsCleaned * getsiteconfig.siteConfiguration.multiplicationFactor ||1;

        return toalPannelsCleaned || 0;
        
    } catch (error:any) {

        throw new Error('Error calculating panels cleaned: ' + error.message);
        
    }
    
}