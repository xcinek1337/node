let typingTimeout;
let nickname;

document.addEventListener('DOMContentLoaded', function () {
	const popup = document.getElementById('popup-overlay');
	const nicknameInput = document.getElementById('popup-input');
	popup.classList.add('show');

	const okButton = document.getElementById('popup-ok');
	okButton.addEventListener('click', function () {
		nickname = nicknameInput.value;
		popup.classList.remove('show');
		window.scrollTo(0, document.body.scrollTop);
		main();
	});
});

function main() {
	var socket = io({ query: { nickname: nickname } });

	var messages = document.getElementById('messages');
	var form = document.getElementById('form');
	var input = document.getElementById('input');

	form.addEventListener('submit', (e) => {
		e.preventDefault();

		if (input.value.startsWith('/msg ')) {
			const recipient = input.value.split(' ')[1];
			const message = input.value.split(' ').slice(2).join(' ');

			socket.emit('private message', { message: message, recipient: recipient });
			sendPrivateMessage({ message: message, recipient: recipient }, 'sender');
			input.value = '';
			return;
		}
		if (input.value) {
			socket.emit('chat message', input.value);
			sendMessage({ message: input.value, user: nickname });
			input.value = '';
		}
	});
	form.addEventListener('keydown', (e) => {
		const inputValue = input.value.trim(); // Usuń zbędne spacje
		const isPrivateMessage = /^\/msg\s+\S+/.test(inputValue); // Sprawdź, czy zaczyna się od "/msg"

		if (!isPrivateMessage && inputValue !== '') {
			// Emituj "isTyping" tylko dla wiadomości na czacie głównym
			socket.emit('isTyping', nickname);
		} else if (isPrivateMessage) {
			console.log('Pisanie prywatnej wiadomości');
		}
	});

	socket.on('onWelcome', (message) => {
		sendMessage(message);
	});

	socket.on('addOnline', (online) => {
		renderOnlineUsers(online);
	});
	socket.on('removeOnline', (online) => {
		renderOnlineUsers(online);
	});

	socket.on('onDisconnect', (message) => {
		sendMessage(message);
	});

	socket.on('chat message', (message) => {
		sendMessage(message);
		const existingTypingMessage = document.querySelector('.isTyping');
		existingTypingMessage.remove();
	});

	socket.on('private message', (message) => {
		sendPrivateMessage(message, 'recipent');
	});

	socket.on('userNotFound', (recipient) => {
		userNotFound(recipient);
	});

	socket.on('isTyping', (message) => {
		isTyping(message);
	});
}

function sendMessage(msg) {
	var item = document.createElement('li');
	if (typeof msg == 'object') {
		const { user, message } = msg;
		item.textContent = `${user}: ${message}`;
	} else {
		item.textContent = msg;
	}
	messages.appendChild(item);
	window.scrollTo(0, document.body.scrollHeight);
}

function userNotFound(recipent) {
	var item = document.createElement('li');
	item.textContent = `${recipent} is not online`;
	item.style.backgroundColor = '#e15656';
	messages.appendChild(item);
	window.scrollTo(0, document.body.scrollHeight);
}

function sendPrivateMessage(msgRecipient, caller) {
	const { message, recipient, sender } = msgRecipient;
	if (caller === 'sender') {
		var item = document.createElement('li');
		item.style.backgroundColor = '#8c8cd1';
		item.innerHTML = `Private message to <strong>${recipient}</strong>: ${message}`;
		messages.appendChild(item);
	} else {
		var item = document.createElement('li');
		item.style.backgroundColor = '#8c8cd1';
		item.innerHTML = `Private message from <strong>${sender}</strong>: ${message}`;
		messages.appendChild(item);
	}
	window.scrollTo(0, document.body.scrollHeight);
}
function isTyping(message) {
	var messages = document.getElementById('messages');
	var item = document.createElement('li');
	item.classList.add('isTyping');
	item.textContent = message;
	const existingTypingMessage = document.querySelector('.isTyping');
	if (existingTypingMessage) {
		existingTypingMessage.remove();
	}
	messages.appendChild(item);

	clearTimeout(typingTimeout);
	typingTimeout = setTimeout(() => {
		item.remove();
	}, 3000);
}

function renderOnlineUsers(onlineUsers) {
	var online = document.getElementById('online');

	while (online.lastChild) {
		if (online.lastChild.nodeName === 'LI') {
			online.lastChild.remove();
		} else {
			break;
		}
	}
	const items = onlineUsers.map((user) => {
		const item = document.createElement('li');
		item.textContent = user;
		return item;
	});
	items.forEach((user) => {
		online.append(user);
	});
}
