const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
// socket
const { Server } = require('socket.io');
const io = new Server(server);

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	const nickname = socket.handshake.query.nickname;

	io.emit('onWelcome', nickname + ' join to the chat');

	socket.on('disconnect', () => {
		io.emit('onDisconnect', nickname + ' left the chat');
	});

	socket.on('chat message', (message) => {
		socket.broadcast.emit('chat message', { message: message, user: nickname });
	});
});

server.listen(3000, () => {
	console.log('listening on localhost:3000');
});
