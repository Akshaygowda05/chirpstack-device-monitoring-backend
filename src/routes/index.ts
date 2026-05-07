import express from "express";  
const router = express.Router();



import userRoutes from "./userRoutes";
import chripstackRouter from "./externalchripstackapi";
import fetchRedisDataRouter from "./redis.Routes";
import robotsBatteriesRouter from "./robotsBatteries.Routes";
import homeRouter from "./home.Routes";
import applicationError from "./error.Routes";
import siteConfigRoutes from "./siteconfig.Routes";
import reportRouter from "./report.routes";

router.use('/api',userRoutes);
router.use('/api',chripstackRouter);
router.use('/api',fetchRedisDataRouter);
router.use(`/api`,robotsBatteriesRouter);
router.use('/api',homeRouter);
router.use('/api',applicationError);
router.use('/api',siteConfigRoutes);
router.use('/api',reportRouter);


export default router;