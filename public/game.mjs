import Player from './Player.mjs';
import Collectible from './Collectible.mjs';


const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let currentPlayers = [];
let item;


function drawCanvas(currentPlayers, item, mainPlayer){
    context.fillText('stuff', 0, 0);
    const playerColors = ['red', 'green', 'blue', 'purple', 'pink']
    const itemColor = 'yellow';
    const bgColor = 'black'
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.font = "20px Arial";
    context.textAlign = 'center';
    context.fillText('Controls: WASD', 80, 18);
    context.fillText('Score:' + mainPlayer.score, canvas.width / 2, 18)
    context.fillText(mainPlayer.calculateRank(currentPlayers), 590, 18)
    context.fillRect(0, 19, canvas.width, 1)
    for (let i = 0; i < currentPlayers.length; i++) {
        context.fillStyle = playerColors[i % playerColors.length];
        context.fillRect(currentPlayers[i].x, currentPlayers[i].y, currentPlayers[i].dimensions, currentPlayers[i].dimensions);
    }
    context.fillStyle = itemColor;
    context.fillRect(item.x, item.y, item.dimensions, item.dimensions)
}

let myPlayer;


socket.on('init', ({id, collectible, players}) => {
    if (myPlayer) {
        return;
    }
    currentPlayers = currentPlayers.concat(players)
    myPlayer = new Player({x: 0, y: 20, score: 0, id: id});
    currentPlayers = currentPlayers.concat(myPlayer);
    socket.emit('new-player', myPlayer);
    
    item = new Collectible(collectible)

    document.onkeydown = (e) => {
        let playerMoved = false;
        switch(e.key) {
            case 'w':
                myPlayer.movePlayer('down', myPlayer.dimensions);
                playerMoved = true;
                break;
            case 'a':
                myPlayer.movePlayer('left', myPlayer.dimensions);
                playerMoved = true;
                break;
            case 's':
                myPlayer.movePlayer('up', myPlayer.dimensions);
                playerMoved = true;
                break;
            case 'd':
                myPlayer.movePlayer('right', myPlayer.dimensions);
                playerMoved = true;
                break;
        }
        if (playerMoved) {
            if (myPlayer.x < 0 ) {
                myPlayer.x = 0;
            } else if (myPlayer.x > canvas.width - myPlayer.dimensions) {
                myPlayer.x = canvas.width - myPlayer.dimensions;
            } else if (myPlayer.y < 20) {
                myPlayer.y = 20;
            } else if (myPlayer.y > canvas.height - myPlayer.dimensions) {
                myPlayer.y = canvas.height - myPlayer.dimensions;
            } else{
                socket.emit('player-moving', {id: myPlayer.id, x: myPlayer.x, y: myPlayer.y});
                if (myPlayer.collision(item)) {
                    myPlayer.score += item.value;
                    socket.emit('player-scoring', {id: myPlayer.id, score: myPlayer.score});
                }
                drawCanvas(currentPlayers, item, myPlayer);
            }
        }
    }

    socket.on('update-players', ({updatedPlayers}) => {
        currentPlayers = updatedPlayers;
        drawCanvas(currentPlayers, item, myPlayer);
    })
    
    socket.on('new-collectible', ({collectible}) => {
        item = new Collectible(collectible)
        drawCanvas(currentPlayers, item, myPlayer);
    })
    
    drawCanvas(currentPlayers, item, myPlayer);
})


