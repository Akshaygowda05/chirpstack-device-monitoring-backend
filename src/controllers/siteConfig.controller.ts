import { Request, Response, NextFunction } from 'express';
import { siteConfigService } from '../services/siteConfiguration';

class siteConfigController {
    async getSiteConfig(req: Request, res: Response, next: NextFunction) {
        try {
            const applicationId = (req as any).applicationId;
            const config = await siteConfigService.getSiteConfig(applicationId);
            res.json(config);
        } catch (error) {
            next(error);
        }

    }

    async updateSiteConfig(req: Request, res: Response, next: NextFunction) {
        try{
            const applicationId = (req as any).applicationId;
            const configData = req.body;
            const updatedConfig = await siteConfigService.updateSiteConfig(applicationId, configData);
            res.json(updatedConfig);
        } catch (error) {
            next(error);
        }
    }
}


export const siteConfigControllerInstance = new siteConfigController();