const Cars = {};
const CarsByPlayerId = {};
let carIdCounter = 0;


// Car socket server
const net = require('net');
const server = new net.Server;

server.listen({
    port: 8000
}, function listening() {
    server.on('connection', function connected(socket) {
        console.log('Car connected!');

        const carId = carIdCounter;
        carIdCounter++;

        const car = Cars[carId] = {
            socket
        };

        socket.on('close', function closed(hadError) {
            console.log(`<${carId}> Connection to the car was closed, hadError:`, hadError);
            delete Cars[carId];
            if (car.playerId) delete CarsByPlayerId[car.playerId];
        });

        socket.on('data', function receivedData(data) {
            const dataString = data.toString();

            console.log(`<${carId}> The car says: ${dataString}>`);
        });

        socket.on('error', function(err) {
            console.log(`<${carId}> Socket error:`, err.stack);
        });
    });
});


// Browser websocket server
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({port: 80});

wss.on('connection', function connection(ws) {
    console.log('Browser connected!');

    ws.on('message', function incoming(message) {
        console.log('Browser says:', message);

        const parsedMsg = /<(\d+)>(.*)/.exec(message);

        if (!parsedMsg || !parsedMsg[1] || !parsedMsg[2]) return;

        const playerId = parsedMsg[1];
        let playersCar = CarsByPlayerId[playerId];
        
        if (!playersCar) {
            for (let key in Cars) {
                const car = Cars[key];

                if (!car.playerId) {
                    car.playerId = playerId;
                    playersCar = CarsByPlayerId[playerId] = car;
                    break;
                }
            }
        }

        if (playersCar) playersCar.socket.write(parsedMsg[2]);
    });

    ws.on('close', function(code) {
        console.log('Connection to the browser was closed, code:', code);
    });

    ws.on('error', function(err) {
        console.log('WebSocket error:', err.stack);
    });
});
