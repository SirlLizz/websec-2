let socket = io();

function start_game() {
    document.getElementById('overlay').style.display='none';
    socket.emit('new_player', document.getElementById('picker').style.color, document.getElementById('inputName').value);
}

let movement = {
    up: false,
    down: false,
    left: false,
    right: false
}

document.addEventListener('keydown', function(event) {
    switch (event.code) {
        case 'KeyA':
            movement.right = false;
            movement.left = true;
            break;
        case 'KeyW':
            movement.down = false;
            movement.up = true;
            break;
        case 'KeyD':
            movement.left = false;
            movement.right = true;
            break;
        case 'KeyS':
            movement.up = false;
            movement.down = true;
            break;
    }
});

document.addEventListener('keyup', function(event) {
    switch (event.code) {
        case 'KeyA':
            movement.left = false;
            break;
        case 'KeyW':
            movement.up = false;
            break;
        case 'KeyD':
            movement.right = false;
            break;
        case 'KeyS':
            movement.down = false;
            break;
    }
});

setInterval(function() {
    socket.emit('movement', movement);
}, 1000 / 60);


socket.on('state', function(players) {
    let canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let context = canvas.getContext('2d');
    context.clearRect(0,0, canvas.width, canvas.height);
    for (let id in players) {
        let player = players[id];
        context.beginPath();
        context.fillStyle = player.color;
        context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        context.fill();
    }
});



