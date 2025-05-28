import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import UserRoute from './Routes/User.route.ts';
import MessageRoute from './Routes/Message.route.ts';
import SocketService from './Services/Socket.Io/socket.service.ts';

import * as dotenv from 'dotenv';
import JsonReaderService from './Services/jsonReader.service.ts';

dotenv.config()

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const allowedOrigin = 'http://localhost:4200';

const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        methods: ['GET', 'POST', 'DELETE', 'PUT'],
    }
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
}));

app.use('/api/users', UserRoute);
app.use('/api/messages', MessageRoute);

new SocketService(io, new JsonReaderService('./src/database/users.json'));

server.listen(port, ()=>{
    console.log('Server started on port', port)
})