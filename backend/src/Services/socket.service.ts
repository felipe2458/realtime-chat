import { Server, Socket } from "socket.io";
import JsonReaderService from "./jsonReader.service.ts";
import { User, UserNoPass } from "../interface/interface.ts";
import { promises as fs } from 'fs';

export default class SocketService{
    private io: Server;

    constructor(io: Server, private jsonReaderService: JsonReaderService){
        this.io = io;
        this.configureEvents();
    }

    private configureEvents(){
        this.io.on('connection', (socket: Socket)=>{
            socket.on('username', async (username: string)=>{
                const users: User[] = await this.jsonReaderService.readJson();

                const updateUsers = users.map(u => {
                    if(u.username === username){
                        return { ...u, idSocket: socket.id };
                    }
                    return u;
                })

                await fs.writeFile('src/database/users.json', JSON.stringify(updateUsers, null, 2));
            })

            socket.on('friendRequestGET', async (data: { to: User, from: User, wasSentFriendRequest: boolean })=>{
                const users: UserNoPass[] = await this.jsonReaderService.readJson();
                const user: UserNoPass = users.filter(u => u.username === data.to.username)[0];

                this.io.to(user.idSocket).emit('friendRequestReceived', data);
            })

            socket.on('removeFriendRequest', async (data: { to: UserNoPass, from: UserNoPass, isErro: boolean })=>{
                const users: UserNoPass[] = await this.jsonReaderService.readJson();
                const user: UserNoPass = users.filter(u => u.username === data.to.username)[0];

                this.io.to(user.idSocket).emit('removeFriendRequest', data);
            });

            socket.on('friendRequestAccepted', async (data: { to: UserNoPass, from: UserNoPass })=>{
                const users: UserNoPass[] = await this.jsonReaderService.readJson();
                const user: UserNoPass = users.filter(u => u.username === data.to.username)[0];

                this.io.to(user.idSocket).emit('friendRequestAccepted', data);
            });

            /*socket.on('disconnect', async ()=>{
                console.log('socketID', socket.id);
            });*/
        });
    }
}