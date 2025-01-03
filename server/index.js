const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./socket');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));

socketHandler(io);

server.listen(3000, () => {
	console.log(`Listening on localhost:3000`);
});
