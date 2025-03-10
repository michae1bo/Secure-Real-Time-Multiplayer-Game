require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const cors = require('cors');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();
app.use(helmet({
  noSniff: true,
  xssFilter: true,
  noCache: true
}))


app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'PHP 7.4.3');
  next();
})

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});


//Game server
const http = require('http').createServer(app);
const io = require('socket.io')(http);
let currentPlayers = [];
let nextID = 0;
let nextItemID = 1;
const height = 480;
const width = 640;
const itemDimesnsions = 3;
const titleHeight = 20;

let item = genNewCollectible();


function genNewCollectible() {
  const x = Math.floor(Math.random() * (width - itemDimesnsions + 1));
  const y = Math.floor(Math.random() * (height - itemDimesnsions - titleHeight + 1) + titleHeight);
  const collectibleObject = {x, y, value: 1, id: nextItemID};
  nextItemID++;
  return collectibleObject;
}

io.on('connection', socket => {
  nextID++;
  const clientId = nextID;
  console.log('User', nextID, 'has connected.');
  const newPlayerObj = {id: nextID, collectible: item, players: currentPlayers}
  io.emit('init', newPlayerObj)
  socket.on('new-player', newPlayer => {
    const currentIds = currentPlayers.map(player => player.id);
      if (!currentIds.includes(newPlayer.id)) {
          currentPlayers.push(newPlayer);
      }
  })
  socket.on('disconnect', () => {
    const playerIds = currentPlayers.map(player => player.id);
    const idIndex = playerIds.indexOf(clientId);
    currentPlayers = currentPlayers.slice(0, idIndex).concat(currentPlayers.slice(idIndex + 1));
    io.emit('update-players', {updatedPlayers: currentPlayers});
    console.log('User', clientId, 'has disconnected.');
  })
  socket.on('player-moving', ({id, x, y}) => {
    for (let i = 0; i < currentPlayers.length; i++) {
      if (currentPlayers[i].id === id) {
          currentPlayers[i].x = x;
          currentPlayers[i].y = y;
          io.emit('update-players', {updatedPlayers: currentPlayers});
          break;
      }
    }
  })

  socket.on('player-scoring', ({id, score}) => {
    console.log(id, 'scored');
    for (let i = 0; i < currentPlayers.length; i++) {
        if (currentPlayers[i].id === id) {
            currentPlayers[i].score = score;
            item = genNewCollectible();
            io.emit('new-collectible', {collectible: item});
            break;
        }
    }
  })
})


const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = http.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
