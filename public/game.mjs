import Player from './Player.mjs';
import Collectible from './Collectible.mjs';


const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let currentPlayers = [];
let item;

socket.on('init', ({id, collectible, players}) => {
    console.log('connected as player', id);
    console.log(players);
    currentPlayers = currentPlayers.concat(players)
    const myPlayer = new Player({x: 0, y: 0, score: 0, id: id});
    currentPlayers = currentPlayers.concat(myPlayer);
    socket.emit('new-player', myPlayer);
    
    item = new Collectible(collectible)

    document.onkeydown = (e) => {
        let playerMoved = false;
        switch(e.key) {
            case 'w':
                myPlayer.movePlayer('up', 1);
                playerMoved = true;
                break;
            case 'a':
                myPlayer.movePlayer('left', 1);
                playerMoved = true;
                break;
            case 's':
                myPlayer.movePlayer('down', 1);
                playerMoved = true;
                break;
            case 'd':
                myPlayer.movePlayer('right', 1);
                playerMoved = true;
                break;
        }
        if (playerMoved) {
            if (myPlayer.x < 0 || myPlayer.x > canvas.width) {
                myPlayer.x = 0;
            } else if (myPlayer.y < 0 || myPlayer.y > canvas.height) {
                myPlayer.y = 0;
            } else{
                socket.emit('player-moving', {id: myPlayer.id, x: myPlayer.x, y: myPlayer.y});
                if (myPlayer.collision(item)) {
                    myPlayer.score += item.value;
                    socket.emit('player-scoring', {id: myPlayer.id, score: myPlayer.score});
                }
                drawCanvas();
            }
        }
    }

    socket.on('new-player', newPlayer => {
        const currentIds = currentPlayers.map(player => player.id);
        if (!currentIds.includes(newPlayer.id)) {
            currentPlayers.push(newPlayer);
            console.log('New player', id , 'has joined')
            drawCanvas();
        }
    })
    
    socket.on('player-moving', ({id, x, y})=> {
        for (let i = 0; i < currentPlayers.length; i++) {
            if (currentPlayers[i].id === id) {
                currentPlayers[i].x = x;
                currentPlayers[i].y = y;
                drawCanvas();
                break;
            }
        }
    })
    
    socket.on('player-scoring', ({id, score}) => {
        for (let i = 0; i < currentPlayers.length; i++) {
            if (currentPlayers[i].id === id) {
                currentPlayers[i].score = score;
                break;
            }
        }
    })
    
    socket.on('new-collectible', ({collectible}) => {
        item = new Collectible(collectible)
        drawCanvas();
    })
    
    socket.on('remove-player', ({id}) => {
        const playerIds = currentPlayers.map(player => player.id);
        const idIndex = playerIds.indexOf(id);
        currentPlayers = currentPlayers.slice(0, idIndex).concat(currentPlayers.slice(idIndex + 1));
        console.log('Player', id, 'has disconnected');
        drawCanvas();
    })
    console.log(currentPlayers)
    drawCanvas();
})

function drawCanvas(){ 

}


