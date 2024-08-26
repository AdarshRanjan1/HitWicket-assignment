// Replace 'ws://localhost:8080' with your WebSocket server URL
const socket = new WebSocket('ws://localhost:8080');

// Function to safely send messages
function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        console.error('WebSocket is not open. ReadyState:', socket.readyState);
    }
}

// Initialize the game by sending a request to the server
function initializeGame() {
    const message = JSON.stringify({ type: 'initialize' });
    sendMessage(message);
}

socket.onopen = function(event) {
    console.log("Connected to WebSocket server.");
    initializeGame(); // Send initialization message once connected
};

socket.onmessage = function(event) {
    const msg = JSON.parse(event.data);
    if (msg.type === 'state') {
        // Handle game state update
        console.log(msg.state);
        // Update the UI with the new game state
    } else if (msg.type === 'error') {
        console.error('Error from server:', msg.message);
    }
};

socket.onclose = function(event) {
    console.log("WebSocket connection closed:", event);
    // Optionally try to reconnect or notify the user
};

socket.onerror = function(event) {
    console.error("WebSocket error:", event);
};

// Example usage: Sending a move
function makeMove(playerId, pieceType, move) {
    const message = JSON.stringify({ type: 'move', playerId, pieceType, move });
    sendMessage(message);
}
