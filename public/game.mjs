import Player from './Player.mjs';
import Collectible from './Collectible.mjs';


const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let currentPlayers = [];
let collectible;

socket.on('init', ({id, collectible, players}) => {
    console.log(id)
    const myPlayer = new Player({x: 0, y: 0, score: 0, id: id});
    socket.emit('new-player', myPlayer);
    socket.on('new-player', newPlayer => {
        currentPlayers.push(newPlayer);
    })
})
