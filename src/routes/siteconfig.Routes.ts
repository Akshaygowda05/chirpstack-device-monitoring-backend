import express from "express";
import { siteConfigControllerInstance } from "../controllers/siteConfig.controller";
import authenticate from "../middlewares/auth.middlware";

const siteConfigRoutes = express.Router();



// first i need to authenticate the user and then i will get the applicationId from the token and then i will pass it to the controller to get the site config for that applicationId
siteConfigRoutes.get('/v1/site-config', authenticate,siteConfigControllerInstance.getSiteConfig);
siteConfigRoutes.put('/v1/site-config', authenticate, siteConfigControllerInstance.updateSiteConfig);


export default siteConfigRoutes;