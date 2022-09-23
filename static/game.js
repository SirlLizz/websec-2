let socket = io();

let name;
let color;

function start_game() {
    color = document.getElementById('picker').style.color;
    name = document.getElementById('inputName').value;
    socket.emit('new_player', color, name);
}

socket.on('new_connect', function(players) {
    for(let checkId in players){
        if(checkId === socket.id){
            document.getElementById('overlay').style.display='none';
            if(document.querySelector('.user-list__item_name') === null){
                if(name === ''){
                    addPlayerInList(socket.id.slice(0,8), color, 'lightgreen');
                }else{
                    addPlayerInList(name, color, 'lightgreen');
                }
            }
            let thisListElem = document.getElementsByClassName("user-list__item_name");
            for (let id in players) {
                let player = players[id];
                let koef = 0;
                for(let elemId = 0; elemId < thisListElem.length; elemId++){
                    if(player.name === thisListElem[elemId].textContent){
                        koef +=1;
                    }
                }
                if(koef === 0){
                    addPlayerInList(player.name, player.color);
                }
            }
            break;
        }
    }
});

socket.on('incorrect_name', function(message, nameSocket) {
    if(socket.id === nameSocket){
        if(message.use){
            alert("This name is already use!");
        }
        if(message.name){
            alert("This name is incorrect!");
        }
    }
});

socket.on('game_over', function(win_player) {
    document.getElementById('overlay-game-over').style.display='block';
    if(win_player === document.querySelector('.user-list__item_name').textContent){
        document.getElementById('img-game-over').src = "https://cdn-icons-png.flaticon.com/512/6941/6941697.png";
        document.getElementById('text-game-over').textContent = "You Win!";
    } else {
        document.getElementById('img-game-over').src = "https://cdn130.picsart.com/300471282019211.png";
        document.getElementById('text-game-over').textContent = "You Lose, Win " + win_player;
    }
});

function addPlayerInList(name, color, backgroundColor = '#eeeeee'){
    let listElem = document.querySelector('#user-list');
    const newItem = document.createElement('div');
    newItem.innerHTML = `
			<div class="user-list__item" style="background-color: ${backgroundColor}">
     			<b class="user-list__item_name">${name}</b>
     			<button class="user-list__item_color" style="background-color: ${color}"></button>
    		</div>
			`;
    listElem.appendChild(newItem);
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

let playerSize = {};
let wall = {};
let startZone = {};
let saveZone = {};

socket.on('level_setting', function(newPlayerSize, newWall, newStartZone, newSaveZone) {
    playerSize = newPlayerSize;
    wall = newWall;
    startZone = newStartZone;
    saveZone = newSaveZone;
});

socket.on('state', function(players, dots) {
    let canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth - 226;
    canvas.height = window.innerHeight;
    let context = canvas.getContext('2d');
    context.clearRect(0,0, canvas.width, canvas.height);
    drawStartZone(context);
    drawSaveZone(context);
    drawWall(context);
    drawDots(context, dots);
    drawPlayers(players, context);
});

function drawPlayers(players, context){
    for (let id in players) {
        let player = players[id];
        context.beginPath();
        context.fillStyle = player.color;
        context.strokeStyle = 'black';
        context.rect(player.x, player.y, playerSize.x,  playerSize.y);
        context.fill();
        context.stroke();
    }
}

function drawWall(context){
    context.beginPath();
    context.strokeStyle = 'black';
    context.rect(wall.x1, wall.y1, wall.x2-wall.x1, wall.y2-wall.y1);
    context.stroke();
}

function drawStartZone(context){
    context.beginPath();
    context.fillStyle = '#40C781FF';
    context.rect(startZone.x1, startZone.y1, startZone.x2-startZone.x1, startZone.y2-startZone.y1);
    context.fill();
}

function drawSaveZone(context){
    context.beginPath();
    context.fillStyle = '#40C781FF';
    context.rect(saveZone.x1, saveZone.y1, saveZone.x2-saveZone.x1, saveZone.y2-saveZone.y1);
    context.fill();
}

function drawDots(context, dots){
    for (let i = 0; i < dots.x.length; i+=1) {
        context.beginPath();
        context.fillStyle = 'blue';
        context.strokeStyle = 'black';
        context.arc(dots.x[i], dots.y[i], playerSize.x/2, 0, 2 * Math.PI);
        context.fill();
        context.stroke();
    }
}


