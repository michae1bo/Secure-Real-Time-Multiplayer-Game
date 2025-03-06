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
let nextID = 1;

io.on('connection', socket => {
  const id = nextID;
  nextID++;
  console.log('User', id, 'has connected.');
  const newPlayerObj = {id: id, collectible: 0, players: currentPlayers}
  io.emit('init', newPlayerObj)
  socket.on('new-player', newPlayer => {
    currentPlayers.push(newPlayer);
  })
  socket.on('disconnect', () => {
    const playerIds = currentPlayers.map(player => player.id);
    const idIndex = playerIds.indexOf(id);
    currentPlayers = currentPlayers.slice(0, idIndex).concat(currentPlayers.slice(idIndex + 1));
    console.log('User', id, 'has disconnected.');
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
