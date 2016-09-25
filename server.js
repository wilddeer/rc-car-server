var carSocket = null;
var browserWebSocket = null;


// Car socket server
var net = require('net');
var server = new net.Server;

server.listen({
    port: 8000
}, function listening() {
    server.on('connection', function connected(socket) {
        console.log('Car connected!');

        carSocket = socket;

        socket.on('close', function closed(hadError) {
            console.log('Connection to the car was closed, hadError:', hadError);
            carSocket = null;
        });

        socket.on('data', function receivedData(data) {
            var dataString = data.toString();

            console.log('The car says:', dataString);

            if (browserWebSocket) browserWebSocket.send(dataString);
        });

        socket.on('error', function(err) {
            console.log('Socket error:', err.stack);
        });
    });
});


// Browser websocket server
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 80});

wss.on('connection', function connection(ws) {
    console.log('Browser connected!');

    browserWebSocket = ws;

    ws.on('message', function incoming(message) {
        console.log('Browser says:', message);

        if (carSocket) carSocket.write(message);
    });

    ws.on('close', function(code) {
        console.log('Connection to the browser was closed, code:', code);
        browserWebSocket = null;
    });

    ws.on('error', function(err) {
        console.log('WebSocket error:', err.stack);
    });
});
