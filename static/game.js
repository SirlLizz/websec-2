let socket = io();

function start_game() {
    let color = document.getElementById('picker').style.color;
    let name = document.getElementById('inputName').value;
    document.getElementById('overlay').style.display='none';
    if(name === ''){
        addPlayer(socket.id.slice(0,8), color, 'lightgreen');
    }else{
        addPlayer(name, color, 'lightgreen');
    }
    socket.emit('new_player', color, name);
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
    canvas.width = window.innerWidth - 226;
    canvas.height = window.innerHeight;
    let context = canvas.getContext('2d');
    context.clearRect(0,0, canvas.width, canvas.height);
    for (let id in players) {
        let player = players[id];
        context.beginPath();
        context.fillStyle = player.color;
        context.rect(player.x, player.y, 20, 20);
        context.fill();
    }
});

socket.on('new_connect', function(players) {
    let thisListElem = document.getElementsByClassName("user-list__item_name");
    console.log(thisListElem);
    for (let id in players) {
        let player = players[id];
        let koef = 0;
        console.log(thisListElem.length)
        for(let elemId = 0; elemId < thisListElem.length; elemId++){
            console.log(thisListElem[elemId].textContent);
            if(player.name === thisListElem[elemId].textContent){
                koef +=1;
            }
        }
        console.log(koef);
        if(koef === 0){
            addPlayer(player.name, player.color);
        }
    }
});

function addPlayer(name, color, backgroundColor = '#eeeeee'){
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


