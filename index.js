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
let guestNumber = 0;
io.on('connection', (socket) => {
	socket.data.username = 'Guest' + guestNumber++;
	io.emit('onWelcome', socket.data.username + ' join to the chat');

	socket.on('disconnect', () => {
		io.emit('onDisconnect', socket.data.username + ' left the chat');
	});

	socket.on('chat message', (message) => {
		console.log(socket.data.username);

		io.emit('chat message', { message: message, user: socket.data.username });
	});
});

server.listen(3000, () => {
	console.log('listening on localhost:3000');
});
