const io  = "socket.io-client";

const socket = io("ws://localhost:3000");

const form = document.getElementById(contact)
const input = document.getElementById('message')

form.addEventListener("submit", function(e){
    e.preventDefault()
    if(input.value) {
        socket.emit("message", input.value)
        input.value = ''
    }
})

// receive a message from the server
socket.on('chat message', (msg) => {
    let messages = document.getElementById('messages');
    let item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    
  });