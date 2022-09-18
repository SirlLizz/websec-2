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
let playerSize = {x: 25, y: 25};
let wall = {x1: 200, y1: 200, x2: 1000, y2: 600};
let startZone = {x1: 200, y1: 200, x2: 350, y2: 600};
let safeZone = {x1: 850, y1: 200, x2: 1000, y2: 600};


io.on('connection', function(socket) {
    socket.on('new_player', function(color, name) {
        console.log('new player' + players[socket.id]);
        if(name === ''){
            players[socket.id] = {
                x: (startZone.x1+startZone.x2 -25)/2,
                y: (startZone.y1+startZone.y2 -25)/2,
                color: color,
                name: socket.id.slice(0,8)
            };
            io.sockets.emit('new_connect', players);
            io.emit('level_setting', playerSize, wall, startZone, safeZone);
        }else{
            let koef = 0;
            for (let id in players) {
                if(players[id].name === name){
                    io.emit('incorrect_name', socket.id);
                    koef +=1;
                }
            }
            if(koef === 0){
                players[socket.id] = {
                    x: (startZone.x1+startZone.x2 -25)/2,
                    y: (startZone.y1+startZone.y2 -25)/2,
                    color: color,
                    name: name
                };
                io.sockets.emit('new_connect', players);
                io.emit('level_setting', playerSize, wall, startZone, safeZone);
            }
        }

        socket.on('disconnect', function() {
            delete players[socket.id];
        });
    });
    socket.on('movement', function(data) {
        let player = players[socket.id] || {};
        console.log(socket.id + ' ' + player.x + ' ' + player.y)
        if (data.left) {
            if(check_crossing(player, data))
                player.x -= 2.5;
        }
        if (data.up) {
            if(check_crossing(player, data))
                player.y -= 2.5;
        }
        if (data.right) {
            if(check_crossing(player, data))
                player.x += 2.5;
        }
        if (data.down) {
            if(check_crossing(player, data))
                player.y += 2.5;
        }
        if(check_safeZone(player)){
            io.sockets.emit('game_over', player.name);
        }
    });
});

setInterval(function() {
    io.sockets.emit('state', players);
}, 1000 / 60);

function check_crossing(player, data) {
    return (player.x > wall.x1 || !data.left) && (player.y > wall.y1 || !data.up) &&
        (player.x < wall.x2-playerSize.x || !data.right) && (player.y < wall.y2-playerSize.y || !data.down);
}

function check_safeZone(player) {
    return (player.x >= safeZone.x1);
}