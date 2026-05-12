import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { Role }  from "@prisma/client";
import envconfig from '../config/envConfig';
import AppError from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';



interface JwtPayload {
    userId?: string;
    role?: Role;
    applicationId?: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: Role;
      applicationId?: string;
    }
  }
}



async function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
       // console.log("Token from header:", token); // Debug log to check the token value
        if (!token) {
            throw new AppError('No token provided',StatusCodes.UNAUTHORIZED);
        }
        const decode = verify(token, envconfig.getTokenSecret()!) as JwtPayload;
      //  console.log("Decoded token payload:", decode); // Debug log to check the decoded token payload

        if(!decode){
           throw new AppError('Invalid token',StatusCodes.UNAUTHORIZED);
        }

        req.userId = decode.userId;
        req.role = decode.role as Role;
        req.applicationId = decode.applicationId;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
}

export default authenticate;