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
            res.status(200).json(users.map(({ password, ...user }) => user));
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
            const users: User[] = await UserService.getAllUsers();
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
                password: hashedPassword,
                friends: [],
                pendingFriendshipsReceived: [],
                pendingFriendshipsSent: [],
                friendRequestsSentDeclined: [],
                idSocket: ''
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
            const user: User | undefined = await UserService.findByUsername(username);

            if(!user){
                res.status(404).json({error: 'User not found'});
                return;
            }

            const isMatch = await bcript.compare(password, user.password);

            if(!isMatch){
                res.status(401).json({error: 'Incorrect password'});
                return;
            }

            const secret = process.env.SECRET || 'default';
            const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '90d' });

            res.status(200).json({ message: 'Login successful', token });
        }catch(err){
            res.status(500).json({error: 'Error fetching users'});
        }
    }

    static async sendFriendRequest(req: Request, res: Response){
        const { loggedInUser, userFriend } = req.body;

        if(!loggedInUser || !userFriend){
            res.status(400).json({error: 'User logged in or user to send friend request not provided'});
            return;
        }

        try{
            const data = await fs.readFile('src/database/users.json', 'utf-8');
            const users = JSON.parse(data);

            const userLogged = users.find((user: { username: string }) => user.username === loggedInUser);
            const friend: User = users.find((user: { username: string }) => user.username === userFriend);

            if(!friend.pendingFriendshipsReceived.some((u: any)=> u.id === userLogged.id && u.username === userLogged.username)){
                userLogged.pendingFriendshipsSent.push({ id: friend.id, username: friend.username });
                friend.pendingFriendshipsReceived.push({ id: userLogged.id, username: userLogged.username });

                await fs.writeFile('src/database/users.json', JSON.stringify(users, null, 2));
                res.status(200).json({ message: 'Friend request sent successfully' });
                return;
            }

            res.status(400).json({ message: 'User already sent friend request' });
        }catch(err){
            res.status(500).json({error: 'Error sending friend request'});
        }
    }

    static async cancelFriendRequest(req: Request, res: Response){
        const { loggedInUser, userFriend } = req.body;

        if(!loggedInUser || !userFriend){
            res.status(400).json({error: 'User logged in or user to send friend request not provided'});
            return;
        }

        try{
            const data = await fs.readFile('src/database/users.json', 'utf-8');
            const users = JSON.parse(data);

            const userLogged = users.find((user: { username: string }) => user.username === loggedInUser);
            const friend: User = users.find((user: { username: string }) => user.username === userFriend);

            if(friend.pendingFriendshipsReceived.some((u: any)=> u.id === userLogged.id && u.username === userLogged.username)){
                const sentIndex = userLogged.pendingFriendshipsSent.findIndex((u: any) => u.id === friend.id && u.username === friend.username);
                const receivedIndex = friend.pendingFriendshipsReceived.findIndex((u: any) => u.id === userLogged.id && u.username === userLogged.username);

                if(sentIndex !== -1 && receivedIndex !== -1){
                    userLogged.pendingFriendshipsSent.splice(sentIndex, 1);
                    friend.pendingFriendshipsReceived.splice(receivedIndex, 1);
                }
                
                await fs.writeFile('src/database/users.json', JSON.stringify(users, null, 2));
                res.status(200).json({ message: 'friend request canceled successfully' });
                return;
            }

            res.status(400).json({ message: 'No friend requests found' });
        }catch(err){
            res.status(500).json({error: 'Error canceling friend request'});
        }
    }
}