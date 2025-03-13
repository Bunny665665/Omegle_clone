// Basic Node.js server for a random chat platform
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let waitingUser = null;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    if (waitingUser) {
        // Pair the users
        socket.partner = waitingUser;
        waitingUser.partner = socket;
        waitingUser.emit('chat_start', { message: 'Connected to a stranger!' });
        socket.emit('chat_start', { message: 'Connected to a stranger!' });
        waitingUser = null;
    } else {
        waitingUser = socket;
    }

    socket.on('message', (data) => {
        if (socket.partner) {
            socket.partner.emit('message', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.partner) {
            socket.partner.emit('chat_end', { message: 'Stranger disconnected.' });
            socket.partner.partner = null;
        }
        if (waitingUser === socket) {
            waitingUser = null;
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
