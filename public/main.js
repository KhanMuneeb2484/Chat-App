const socket = io();

const clientsTotal = document.getElementById('clients-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

const messageTone = new Audio("/notificationTone.mp3");

// Event listener for form submission
messageForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    sendMessage();
});

// Listen for total clients connected
socket.on('clients-total', (data) => {
    clientsTotal.innerText = `Total clients: ${data}`;
});

// Function to send a message
function sendMessage() {
    if (messageInput.value === "") {
        return; // Do not send an empty message
    }

    const data = {
        name: nameInput.value,
        message: messageInput.value,
        dateTime: new Date()
    };

    socket.emit('message', data); // Send message to server
    addMessageToUI(true, data);   // Display own message in UI
    messageInput.value = '';      // Clear the input field
}

// Listen for incoming chat messages
socket.on('chat-message', (data) => {
    messageTone.play();
    addMessageToUI(false, data);
});

// Function to add messages to the UI
function addMessageToUI(isOwnMessage, data) {
    clearFeedback();

    // Format the date and time in 12-hour format with AM/PM notation
    const options = { 
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true, timeZoneName: 'short'
    };
    const dateTimeString = new Intl.DateTimeFormat('en-US', options).format(new Date(data.dateTime));

    // Create the message element
    const element = `
    <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
        <p class="message">
            ${data.message}
            <span>${data.name} ⚪ ${dateTimeString}</span>
        </p>
    </li>
    `;
    messageContainer.innerHTML += element;
    scrollToBottom();
}

// Function to scroll to the bottom of the message container
function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// Feedback for typing indication
messageInput.addEventListener("focus", (e) => {
    socket.emit("feedback", {
        feedback: `✍${nameInput.value} is typing a message...`
    });
});

messageInput.addEventListener("keypress", (e) => {
    socket.emit("feedback", {
        feedback: `✍${nameInput.value} is typing a message...`
    });
});

messageInput.addEventListener("blur", (e) => {
    socket.emit("feedback", {
        feedback: ""
    });
});

// Listen for typing feedback from other users
socket.on("feedback", (data) => {
    clearFeedback();
    const element = `
     <li class="message-feedback">
        <p class="feedback" id="feedback">${data.feedback}</p>
    </li>
    `;
    messageContainer.innerHTML += element;
});

// Function to clear feedback messages
function clearFeedback() {
    document.querySelectorAll("li.message-feedback").forEach(element => {
        element.parentNode.removeChild(element);
    });
}
