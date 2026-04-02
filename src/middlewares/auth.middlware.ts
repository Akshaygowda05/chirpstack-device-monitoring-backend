import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { Role } from '../generated/prisma/enums';



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
        if (!token) {
            return res.status(401).json({ error: 'Authorization token missing' });
        }
        const decode = verify(token, process.env.JWT_SECRET!) as JwtPayload;

        if(!decode){
            res.status(401).json({
                message:"session expried ,login again!"
            })
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