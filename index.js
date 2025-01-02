const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
// socket
const { Server } = require('socket.io');
const io = new Server(server);

const online = [];
const userSockets = {};

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	const nickname = socket.handshake.query.nickname;

	online.push(nickname);
	userSockets[nickname] = socket.id;

	io.emit('onWelcome', nickname + ' join to the chat');
	io.emit('addOnline', online);

	socket.on('disconnect', () => {
		io.emit('onDisconnect', nickname + ' left the chat');
		online.pop(nickname);
		io.emit('removeOnline', online);
	});

	socket.on('chat message', (message) => {
		socket.broadcast.emit('chat message', { message: message, user: nickname });
	});

	socket.on('private message', (msgRecipient) => {
		console.log('server');
		
		const { message, recipient } = msgRecipient;
		const recipientSocketId = userSockets[recipient];

		if (recipientSocketId) {
			io.to(recipientSocketId).emit('private message', { message: message, sender: nickname });
		} else {
			socket.emit('userNotFound', recipient);
		}
	});

	socket.on('isTyping', (nickname) => {
		socket.broadcast.emit('isTyping', nickname + ' is typing...');
	});
});

server.listen(3000, () => {
	console.log('listening on localhost:3000');
});