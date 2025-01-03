const { addUser, removeUser, getOnlineUsers, getSocketId } = require('./utils/users');

module.exports = (io) => {
    io.on('connection', (socket) => {
        const nickname = socket.handshake.query.nickname;

        addUser(nickname, socket.id);
        io.emit('addOnline', getOnlineUsers());
        io.emit('onWelcome', `${nickname} joined the chat`);

        socket.on('disconnect', () => {
            removeUser(nickname);
            io.emit('removeOnline', getOnlineUsers());
            io.emit('onDisconnect', `${nickname} left the chat`);
        });

        socket.on('chat message', (message) => {
            socket.broadcast.emit('chat message', { message, user: nickname });
        });

        socket.on('private message', ({ message, recipient }) => {
            const recipientSocketId = getSocketId(recipient);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('private message', { message, sender: nickname });
            } else {
                socket.emit('userNotFound', recipient);
            }
        });

        socket.on('isTyping', () => {
            socket.broadcast.emit('isTyping', `${nickname} is typing...`);
        });
    });
};