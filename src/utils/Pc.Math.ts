import { prisma } from "../config/primsaConfig";
import { getRedisClient } from "../config/redis";

const redis = getRedisClient();

const CACHE_TTL = 1800;  // 30 minutes in seconds

type SiteConfigType = {
  panelsGap: number;
  panelWidth: number;
  multiplicationFactor: number;
  isConfigured: boolean;
};

export async function calculatePanelsCleaned(
  applicationId: string,
  currentOdometer: number
): Promise<number | null> {
  try {
    const cacheKey = `siteConfig:${applicationId}`;

  
    let siteconfig: SiteConfigType;

    const cached = await redis.get(cacheKey);
    if (cached) {
      siteconfig = JSON.parse(cached) as SiteConfigType;
    } else {
    
      const app = await prisma.chirpstackApplication.findUnique({
        where: { chirpstackId: applicationId },
        include: { siteConfiguration: true }
      });

      if (!app) return null;

      
      if (!app.siteConfiguration) {
        await prisma.siteConfiguration.create({
          data: { applicationId }
        });
        return null;
      }

      siteconfig = {
        panelsGap: app.siteConfiguration.panelsGap,
        panelWidth: app.siteConfiguration.panelWidth,
        multiplicationFactor: app.siteConfiguration.multiplicationFactor,
        isConfigured: app.siteConfiguration.isConfigured
      };


     
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(siteconfig));
    }

   
    if (!siteconfig.isConfigured) {
      return null; 
    }

   
    const effectiveCleaningWidth =
      siteconfig.panelsGap + siteconfig.panelWidth;

    if (effectiveCleaningWidth <= 0) {
      return null; 
    }

    const panelsCleaned = Math.floor(
      currentOdometer / effectiveCleaningWidth
    );

    const totalPanelsCleaned =
      panelsCleaned * siteconfig.multiplicationFactor;

    return totalPanelsCleaned;

  } catch (error: any) {
    throw new Error(
      "Error calculating panels cleaned: " + error.message
    );
  }
}