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
    console.log('Run server by port 5000');
});

let players = {};
let playerSize = {x: 25, y: 25};
let wall = {x1: 200, y1: 200, x2: 1000, y2: 600};
let startZone = {x1: 200, y1: 200, x2: 350, y2: 600};
let saveZone = {x1: 850, y1: 200, x2: 1000, y2: 600};
let xCenter = (startZone.x1+startZone.x2)/2
let yCenter = (startZone.y1+startZone.y2)/2;
let dotsSpeedX = [6, -6, 6, -6, 6, -6, 6, -6, 6]
let dotsSpeedY = [6, -6, 6, -6, 6, -6, 6, -6, 6]
let dots = {
    x: [400, 450, 500, 550, 600, 650, 700, 750, 800],
    y: [580, 550, 500, 450, 400, 350, 300, 250, 220],
}

io.on('connection', function(socket) {
    socket.on('new_player', function(color, name) {
        if(name === ''){
            players[socket.id] = {
                x: xCenter - playerSize.x/2,
                y: yCenter - playerSize.y/2,
                color: color,
                name: socket.id.slice(0,8),
                updateTime: new Date().getTime()
            };
            io.sockets.emit('new_connect', players);
            io.emit('level_setting', playerSize, wall, startZone, saveZone);
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
                    x: xCenter - playerSize.x/2,
                    y: yCenter - playerSize.y/2,
                    color: color,
                    name: name
                };
                io.sockets.emit('new_connect', players);
                io.emit('level_setting', playerSize, wall, startZone, saveZone);
            }
        }

        socket.on('disconnect', function() {
            delete players[socket.id];
        });
    });

    socket.on('movement', function(data) {
        let currentTime = (new Date()).getTime();
        let player = players[socket.id] || {};
        let timeDifference = (currentTime - player.updateTime)/15;

        console.log(timeDifference)
        checkDotsCrossing(player);
        if (data.left) {
            if(checkCrossing(player, data))
                player.x -= 2.5* timeDifference;
        }
        if (data.up) {
            if(checkCrossing(player, data))
                player.y -= 2.5* timeDifference;
        }
        if (data.right) {
            if(checkCrossing(player, data))
                player.x += 2.5* timeDifference;
        }
        if (data.down) {
            if(checkCrossing(player, data))
                player.y += 2.5* timeDifference;
        }
        player.updateTime = currentTime;
        if(checkSaveZone(player)){
            io.sockets.emit('game_over', player.name);
        }
    });
});

setInterval(function() {
    moveDots();
    io.sockets.emit('state', players, dots);
}, 1000 / 60);

function checkCrossing(player, data) {
    return (player.x > wall.x1 || !data.left) && (player.y > wall.y1 || !data.up) &&
        (player.x < wall.x2-playerSize.x || !data.right) && (player.y < wall.y2-playerSize.y || !data.down);
}

function checkSaveZone(player) {
    return (player.x >= saveZone.x1);
}

function moveDots() {
    for (let i = 0; i < dots.x.length; i+=1) {
        if ( dots.y[i] + dotsSpeedY[i]-playerSize.x/2 < wall.y1 || dots.y[i] + dotsSpeedY[i]+playerSize.x/2 > wall.y2 ||
            dots.x[i] + dotsSpeedX[i]-playerSize.x/2 < startZone.x2 || dots.x[i] + dotsSpeedX[i]+playerSize.x/2 > saveZone.x1) {
            if(i%2 === 0){
                dotsSpeedY[i] = -dotsSpeedY[i];
            }else{
                dotsSpeedX[i] = -dotsSpeedX[i];
            }
        }
        if(i%2 === 0){
            dots.y[i]= dots.y[i] + dotsSpeedY[i];
        }else{
            dots.x[i]= dots.x[i] + dotsSpeedX[i];
        }
    }
}

function checkDotsCrossing(player){
    for (let i = 0; i < dots.x.length; i+=1) {
        let d = Math.sqrt(Math.pow(player.x + playerSize.x/2 -dots.x[i], 2) + Math.pow(player.y + playerSize.y/2-dots.y[i], 2));
        if (d <= 30) {
            player.x = xCenter - playerSize.x/2;
            player.y = yCenter - playerSize.y/2;
            console.log(player.name + ' died by dot ' + i);
        }
    }
}