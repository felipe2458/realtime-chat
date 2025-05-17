import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authMiddleware = (req: Request, res: Response, next: NextFunction)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader){
        res.status(401).json({ message: 'Token not provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try{
        const secret = process.env.SECRET;
        jwt.verify(token, secret as string);
        next();
    }catch(err){
        res.status(401).json({ message: 'Invalid token' });
    }
};

export default authMiddleware;