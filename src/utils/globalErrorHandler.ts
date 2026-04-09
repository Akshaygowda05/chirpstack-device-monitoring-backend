import { Request, Response, NextFunction } from "express";
import loggers from "../config/logger";

export function globalErrorHandler(
    err: any, 
    req: Request, 
    res: Response, 
    next: NextFunction 
) {
    let errorData;

    if (err instanceof Error) {
        errorData = {
            message: err.message,
            status: (err as any).statusCode || 500,
            isOperational: (err as any).isOperational || false
        };
    } else {
        errorData = {
            message: 'An unexpected error occurred',
            status: 500,
            isOperational: false
        };
    }
  loggers.error(`Error: ${errorData.message}, Status: ${errorData.status}, Operational: ${errorData.isOperational}`);
   
    res.status(errorData.status).json({
        success: false,
        ...errorData
    });
}
