import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';


async function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authorization token missing' });
        }
        const decode = verify(token, process.env.JWT_SECRET!);

        if(!decode){
            res.status(401).json({
                message:"session expried ,login again!"
            })
        }

        req.userId = (decode as any).userId;
        req.role = (decode as any).role;
        req.applicationId = (decode as any).applicationId;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
}

export default authenticate;