const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// Game state
let gameState = {
    board: Array(5).fill(null).map(() => Array(5).fill(null)),
    players: {},
    currentPlayer: 'A'
};

// Initialize player pieces
function initializePlayer(playerId) {
    let row = playerId === 'A' ? 0 : 4;
    gameState.players[playerId] = {
        pieces: [
            { type: 'P', position: [row, 0] }, 
            { type: 'P', position: [row, 1] },
            { type: 'H1', position: [row, 2] },
            { type: 'H2', position: [row, 3] },
            { type: 'P', position: [row, 4] }
        ]
    };
    gameState.players[playerId].pieces.forEach(piece => {
        gameState.board[piece.position[0]][piece.position[1]] = `${playerId}-${piece.type}`;
    });
}

// Reset and initialize game state
function initializeGame() {
    gameState = {
        board: Array(5).fill(null).map(() => Array(5).fill(null)),
        players: {},
        currentPlayer: 'A'
    };
    initializePlayer('A');
    initializePlayer('B');
}

function validateMove(playerId, pieceType, move, position) {
    // Implement move validation logic here
    return true; // Simplified for the example
}

function updateGameState(playerId, pieceType, move) {
    const piece = gameState.players[playerId].pieces.find(p => p.type === pieceType);
    if (!piece) return false;

    let [row, col] = piece.position;
    switch (move) {
        case 'L': col -= 1; break;
        case 'R': col += 1; break;
        case 'F': row -= 1; break;
        case 'B': row += 1; break;
    }

    if (row < 0 || row > 4 || col < 0 || col > 4) return false;

    gameState.board[piece.position[0]][piece.position[1]] = null;
    piece.position = [row, col];
    gameState.board[row][col] = `${playerId}-${piece.type}`;

    return true;
}

// Error handling for the WebSocket server
wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

wss.on('connection', ws => {
    // Error handling for individual WebSocket connections
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('message', message => {
        const msg = JSON.parse(message);

        if (msg.type === 'initialize') {
            initializeGame();
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'state', state: gameState }));
                }
            });
        } else if (msg.type === 'move') {
            const { playerId, pieceType, move } = msg;
            if (gameState.currentPlayer !== playerId) {
                ws.send(JSON.stringify({ type: 'error', message: 'Not your turn!' }));
                return;
            }

            const valid = validateMove(playerId, pieceType, move, gameState.players[playerId].pieces);
            if (valid) {
                updateGameState(playerId, pieceType, move);
                gameState.currentPlayer = gameState.currentPlayer === 'A' ? 'B' : 'A';
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'state', state: gameState }));
                    }
                });
            } else {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid move!' }));
            }
        }
    });
});

console.log("WebSocket server is running on ws://localhost:8080");
