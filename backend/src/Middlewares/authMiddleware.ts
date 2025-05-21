import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserService from '../Services/user.service.ts';

const authMiddleware = async (req: Request, res: Response, next: NextFunction)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader){
        res.status(401).json({ message: 'Token not provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try{
        const secret = process.env.SECRET;
        const decoded = jwt.verify(token, secret as string) as { id: number, username: string };
        const allUsers = await UserService.getAllUsers();

        if(!allUsers.find(user => user.id === decoded.id)){
            res.status(401).json({ message: 'Invalid token' });
            return;
        }

        next();
    }catch(err){
        res.status(401).json({ message: 'Invalid token' });
    }
};

export default authMiddleware;