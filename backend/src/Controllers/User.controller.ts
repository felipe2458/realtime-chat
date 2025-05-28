import jwt from 'jsonwebtoken';
import bcript from 'bcrypt';
import { promises as fs } from 'fs';
import { Request, Response } from 'express'
import { User, UserNoPass } from '../interface/interface.ts';
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
                friendRequestsDeclined: { sent: [], received: [] },
                friendRemoved: [],
                removedByFriend: [],
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

            const userLogged: UserNoPass = users.find((user: { username: string }) => user.username === loggedInUser);
            const friend: UserNoPass = users.find((user: { username: string }) => user.username === userFriend);

            if(userLogged.pendingFriendshipsReceived.some((u: any)=> u.id === friend.id && u.username === friend.username)){
                res.status(400).json({ message: 'You have already received a friend request from this user' });
                return;
            }

            if(userLogged.friendRequestsDeclined.sent.some((u: any)=> u.id === friend.id && u.username === friend.username)){
                res.status(400).json({ message: 'This user declined your friend request' });
                return;
            }

            if(userLogged.removedByFriend.some((u: any)=> u.username === friend.username) || friend.friendRemoved.some((u: any)=> u.username === userLogged.username)){
                res.status(400).json({ message: 'This user has removed you from their friends list' });
                return;
            }

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

    static async acceptFriendRequest(req: Request, res: Response){
        const { loggedInUser, userFriend } = req.body;

        if(!loggedInUser || !userFriend){
            res.status(400).json({error: 'User logged in or user to send friend request not provided'});
            return;
        }

        try{
            const data = await fs.readFile('src/database/users.json', 'utf-8');
            const users: UserNoPass[] = JSON.parse(data);
            const userLogged: UserNoPass = users.filter(user => user.username === loggedInUser)[0];
            const friend: UserNoPass = users.filter(user => user.username === userFriend)[0];

            if(!userLogged.pendingFriendshipsReceived.some((u: { id: number, username: string }) => u.id === friend.id && u.username === friend.username) || !friend.pendingFriendshipsSent.some((u: { id: number, username: string }) => u.id === userLogged.id && u.username === userLogged.username)){
                const indexOfFriendInUserLogged = userLogged.pendingFriendshipsReceived.findIndex((u: { id: number, username: string }) => u.id === friend.id && u.username === friend.username);
                const indexOfUserLoggedInFriend = friend.pendingFriendshipsSent.findIndex((u: { id: number, username: string }) => u.id === userLogged.id && u.username === userLogged.username);

                if(indexOfFriendInUserLogged !== -1){
                    userLogged.pendingFriendshipsReceived.splice(indexOfFriendInUserLogged, 1);
                }

                if(indexOfUserLoggedInFriend !== -1){
                    friend.pendingFriendshipsSent.splice(indexOfUserLoggedInFriend, 1);
                }

                await fs.writeFile('src/database/users.json', JSON.stringify(users, null, 2));
                res.status(401).json({ message: 'Error: no friend requests found' });
                return;
            }

            if(userLogged.friends.some(u => u.username === friend.username) || friend.friends.some(u => u.username === userLogged.username)){
                res.status(400).json({ message: 'You are already friends with this user' });
                return;
            }

            userLogged.pendingFriendshipsReceived = userLogged.pendingFriendshipsReceived.filter(u => u.username !== friend.username);
            friend.pendingFriendshipsSent = friend.pendingFriendshipsSent.filter(u => u.username !== userLogged.username);

            userLogged.friends.push({ username: friend.username });
            friend.friends.push({ username: userLogged.username });

            await fs.writeFile('src/database/users.json', JSON.stringify(users, null, 2));

            res.status(200).json({ message: 'Friend request accepted successfully' });
        }catch(err){
            res.status(500).json({error: 'Error accepting friend request'});
            return;
        }
    }

    static async rejectFriendRequest(req: Request, res: Response){
        const { loggedInUser, userFriend } = req.body;

        if(!loggedInUser || !userFriend){
            res.status(400).json({error: 'User logged in or user to send friend request not provided'});
            return;
        }

        try{
            const data = await fs.readFile('src/database/users.json', 'utf-8');
            const users: UserNoPass[] = JSON.parse(data);

            const userLogged: UserNoPass = users.filter(user => user.username === userFriend)[0];
            const NotFriend: UserNoPass = users.filter(user => user.username === loggedInUser)[0];

            if(userLogged.friendRequestsDeclined.sent.some((u: { id: number, username: string }) => u.id === NotFriend.id && u.username === NotFriend.username)){
                res.status(400).json({ message: 'You have already declined this friend request' });
                return;
            }

            userLogged.friendRequestsDeclined.sent.push({ id: NotFriend.id, username: NotFriend.username });
            userLogged.pendingFriendshipsSent = userLogged.pendingFriendshipsSent.filter(u => u.username !== NotFriend.username);

            NotFriend.friendRequestsDeclined.received.push({ id: userLogged.id, username: userLogged.username });
            NotFriend.pendingFriendshipsReceived = NotFriend.pendingFriendshipsReceived.filter(u => u.username !== userLogged.username);

            await fs.writeFile('src/database/users.json', JSON.stringify(users, null, 2));
            res.status(200).json({ message: 'Friend request rejected successfully' });
        }catch(err){
            res.status(500).json({error: 'Error rejecting friend request'});
            return;
        }
    }

    static async RemoveFriend(req: Request, res: Response){
        const { loggedInUser, userFriend } = req.body;

        if(!loggedInUser || !userFriend){
            res.status(400).json({error: 'User logged in or user to send friend request not provided'});
            return;
        }

        try{
            const data = await fs.readFile('src/database/users.json', 'utf-8');
            const users = JSON.parse(data);

            const userLogged: UserNoPass = users.find((user: { username: string }) => user.username === loggedInUser);
            const noFriend: UserNoPass = users.find((user: { username: string }) => user.username === userFriend);

            if(userLogged.friendRemoved.some((u: { username: string }) => u.username === noFriend.username) || noFriend.removedByFriend.some((u: { username: string }) => u.username === userLogged.username)){
                res.status(400).json({ message: 'You have already removed this friend' });
                return;
            }

            userLogged.friends.splice(userLogged.friends.findIndex(f => f.username === noFriend.username), 1);
            userLogged.friendRemoved.push({ id: noFriend.id, username: noFriend.username });

            noFriend.friends.splice(noFriend.friends.findIndex(f => f.username === userLogged.username), 1);
            noFriend.removedByFriend.push({ id: userLogged.id, username: userLogged.username });

            await fs.writeFile('src/database/users.json', JSON.stringify(users, null, 2));
            res.status(200).json({ message: 'Friend removed successfully' });
        }catch(err){
            res.status(500).json({error: 'error when trying to remove friend'});
            console.log(err);
        }
    }
}