import express from "express";  
const router = express.Router();



import userRoutes from "./userRoutes";
import chripstackRouter from "../services/externalchripstackapi";
import fetchRedisDataRouter from "./redis.Routes";
import robotsBatteriesRouter from "./robotsBatteries.Routes";

router.use('/api',userRoutes);
router.use('/api',chripstackRouter);
router.use('/api',fetchRedisDataRouter);
router.use(`/api`,robotsBatteriesRouter);


export default router;