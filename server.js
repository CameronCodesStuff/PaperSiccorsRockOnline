const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });
let players = [];

server.on('connection', (socket) => {
    if (players.length < 2) {
        players.push(socket);
        socket.send(JSON.stringify({ message: `Connected! Waiting for opponent...` }));
    }

    if (players.length === 2) {
        players.forEach((player, index) => {
            player.send(JSON.stringify({ message: `Both players connected! Make your choice.` }));
        });
    }

    socket.on('message', (data) => {
        const message = JSON.parse(data);
        socket.choice = message.choice;

        if (players[0].choice && players[1].choice) {
            sendResults();
        }
    });

    socket.on('close', () => {
        players = players.filter(player => player !== socket);
    });
});

function sendResults() {
    const [p1, p2] = players;
    const result = determineWinner(p1.choice, p2.choice);

    players.forEach(player => player.send(JSON.stringify({ result })));
    players.forEach(player => player.choice = null);
}

function determineWinner(choice1, choice2) {
    if (choice1 === choice2) return "It's a tie!";
    if ((choice1 === 'rock' && choice2 === 'scissors') ||
        (choice1 === 'scissors' && choice2 === 'paper') ||
        (choice1 === 'paper' && choice2 === 'rock')) {
        return "Player 1 wins!";
    }
    return "Player 2 wins!";
}

console.log("WebSocket server running on ws://localhost:8080");
