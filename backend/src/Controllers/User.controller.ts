import jwt from 'jsonwebtoken';
import bcript from 'bcrypt';
import { promises as fs } from 'fs';
import { Request, Response } from 'express'
import { User } from '../interface/interface.ts';
import UserService from '../Services/user.service.ts';

export default class UserController{
    static async getAllUsers(req: Request, res: Response){
        try{
            const users: User[] = await UserService.getAllUsers();
            res.status(200).json(users);
        }catch(err){
            console.error(err);
            res.status(500).json({error: 'Error fetching users'});
        }
    }

    static async createUser(req: Request, res: Response){
        const { username, password } = req.body;

        if(!username || !password){
            res.status(400).json({error: 'Username and password are required'});
        }

        try{
            const users = await UserService.getAllUsers();
            const userExists = await UserService.findByUsername(username);

            if(userExists){
                res.status(400).json({error: 'User already exists'});
                return;
            }

            const hashedPassword = await bcript.hash(password, 10);

            const lastId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
            const newId = lastId + 1;

            const newUser: User = {
                id: newId,
                username,
                password: hashedPassword
            }

            await fs.writeFile('src/database/users.json', JSON.stringify([...users, newUser], null, 2));

            res.status(200).json({ message: 'User created successfully' });
        }catch(err){
            res.status(500).json({error: 'Error creating user'});
        }
    }

    static async login(req: Request, res: Response){
        const { username, password } = req.body;

        if(!username || !password){
            res.status(400).json({error: 'Username and password are required'});
        }

        try{
            const user = await UserService.findByUsername(username);

            if(!user){
                res.status(400).json({error: 'User not found'});
                return;
            }

            const isMatch = await bcript.compare(password, user.password);

            if(!isMatch){
                res.status(400).json({error: 'Incorrect password'});
                return;
            }

            const secret = process.env.SECRET || 'default';
            const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '90d' });

            res.status(200).json({ message: 'Login successful', token });
        }catch(err){
            res.status(500).json({error: 'Error fetching users'});
        }
    }
}