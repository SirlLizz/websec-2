let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');
let app = express();
let server = http.Server(app);
let io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/public/'));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(5000, function() {
    console.log('Запускаю сервер на порте 5000');
});

let players = {};

io.on('connection', function(socket) {
    socket.on('new_player', function(color, name) {
        console.log('new player' + players[socket.id])
        if(name === ''){
            players[socket.id] = {
                x: 300,
                y: 300,
                color: color,
                name: socket.id.slice(0,8)
            };
        }else{
            players[socket.id] = {
                x: 300,
                y: 300,
                color: color,
                name: name
            };
        }
        io.sockets.emit('new_connect', players);
        socket.on('disconnect', function() {
            delete players[socket.id];
        });
    });
    socket.on('movement', function(data) {
        let player = players[socket.id] || {};
        console.log(socket.id + ' ' + player.x + ' ' + player.y)
        if (data.left) {
            if(check_colicity(player, data))
                player.x -= 5;
        }
        if (data.up) {
            if(check_colicity(player, data))
                player.y -= 5;
        }
        if (data.right) {
            if(check_colicity(player, data))
                player.x += 5;
        }
        if (data.down) {
            if(check_colicity(player, data))
                player.y += 5;
        }
    });
});

setInterval(function() {
    io.sockets.emit('state', players);
}, 1000 / 60);

function check_colicity(player, data) {
    return (player.x > 0 || !data.left) && (player.y > 0 || !data.up);
    
}