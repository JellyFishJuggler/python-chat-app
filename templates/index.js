const socket = io();
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const currentUsernmeSpan = document.getElementById('current-username');
const usernameInput = document.getElementById('username-input');
const updateUserButton = document.getElementById('update-username-button');

let currentUsername = "";

socket.on("set_username", (data) => {
    currentUsername = data.username;
    currentUsernmeSpan.textContent = `Your username: ${currentUsername}`; 
})

socket.on("user_joined", data => {
    addMessage(`${data.username} joined the chat`, "system");
})

socket.on("user_left", data => {
    addMessage(`${data.username} left the chat`, "system");
})

socket.on("new_message", data => {
    addMessage(data.message, "user", data.username, data.avatar);
})

socket.on("username_updated", data => {
    addMessage(`${data.old_username} changed their username to ${data.new_username}`, "system");
    if(data.old_username === currentUsername) {
        currentUsername = data.new_username;
        currentUsernmeSpan.textContent = `Your username: ${currentUsername}`;
    }
})
sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter") sendMessage();
});

updateUserButton.addEventListener("click", updateUsername);

function sendMessage(){
    const message = messageInput.value.trim();
    if(message){
        socket.emit("send_message", {message});
        messageInput.value = "";
    }
}
function addMessage(message, type, username="", avatar=""){
    const messageEle = document.createElement("div");
    messageEle.classList.add("message");

    if(type === "user"){
        const isSentMessage = username === currentUsername;
        if(isSentMessage){
            messageEle.classList.add("sent");
        }
        const avatarEle = document.createElement("img");
        avatarEle.src = avatar;
        messageEle.appendChild(avatarEle);

        const contentDiv = document.createElement("div");
        contentDiv.className = "message-container";

        const usernameDiv = document.createElement("div");
        usernameDiv.textContent = username;
        usernameDiv.className = "message-username";
        contentDiv.appendChild(usernameDiv);

        const messageText = document.createElement("div");
        messageText.textContent = message;

        messageEle.appendChild(contentDiv);

    } else if(type === "system"){
        messageEle.classList.add("system");
        messageEle.textContent = message;
    }

    chatMessages.appendChild(messageEle);
    chatMessages.scrollTop = chatMessages.scrollHeight;

}
function updateUsername(){
    const newUsername = usernameInput.value.trim();
    if(newUsername && newUsername !== currentUsername){
        socket.emit("update_username", {username : newUsername});
        usernameInput.value = "";
    }
}