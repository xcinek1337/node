const onlineUsers = {};
const socketMapping = {};

function addUser(nickname, socketId) {
	onlineUsers[nickname] = socketId;
	socketMapping[socketId] = nickname;
}

function removeUser(nickname) {
	const socketId = onlineUsers[nickname];
	if (socketId) {
		delete onlineUsers[nickname];
		delete socketMapping[socketId];
	}
}

function getOnlineUsers() {
	return Object.keys(onlineUsers);
}

function getSocketId(nickname) {
	return onlineUsers[nickname];
}

module.exports = { addUser, removeUser, getOnlineUsers, getSocketId };
