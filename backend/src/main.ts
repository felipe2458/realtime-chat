import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import UserRoute from './Routes/User.route.ts';
import MessageRoute from './Routes/Message.route.ts';
import chatHandler from './Sockets/chatHandler.ts';
import * as dotenv from 'dotenv';

dotenv.config()

const app = express();
const server = http.createServer(app);
const allowedOrigin = 'http://localhost:4200';
const io = new SocketServer(server, {
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

chatHandler(io);

const port = process.env.PORT || 3000;

server.listen(port, ()=>{
    console.log('Server started on port', port)
})