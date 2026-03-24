import express from "express";  
const router = express.Router();



import userRoutes from "./userRoutes";
import chripstackRouter from "../services/externalchripstackapi";

router.use('/api',userRoutes);
router.use('/api',chripstackRouter);


export default router;