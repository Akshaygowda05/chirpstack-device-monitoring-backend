import express  from "express";
import errorController from "../controllers/error.controller";
import authenticate from "../middlewares/auth.middlware";

const applicationError = express.Router();


applicationError.get("/errors",authenticate, errorController.getErrors);
applicationError.get("/warnings", authenticate, errorController.getWarningDevices);
applicationError.get("/critical", authenticate, errorController.getCriticalDevices);

export default applicationError;