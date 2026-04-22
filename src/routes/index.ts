import express from "express";  
const router = express.Router();



import userRoutes from "./userRoutes";
import chripstackRouter from "./externalchripstackapi";
import fetchRedisDataRouter from "./redis.Routes";
import robotsBatteriesRouter from "./robotsBatteries.Routes";
import homeRouter from "./home.Routes";
import applicationError from "./error.Routes";

router.use('/api',userRoutes);
router.use('/api',chripstackRouter);
router.use('/api',fetchRedisDataRouter);
router.use(`/api`,robotsBatteriesRouter);
router.use('/api',homeRouter);
router.use('/api',applicationError);


export default router;