const express = require("express");
const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 8000;
const ioServer = require('socket.io')(http);
const uuid = require("short-uuid");
const players = new Map();

app.enable('verbose errors');
require('events').EventEmitter.defaultMaxListeners = 0;
app.use(express.static(__dirname + '/public'));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/pages/index.html");
})

function registerSocketServer() {
  console.log("Registered Socket Server!");
  ioServer.on('connection', (socket) => {


    socket.on('join_game', (data) => {
      let player = data.player;
      let id = socket.id;
      let playerData = {x: player.x, y: player.y, color: player.color, id: id};
      players.set(id, playerData);
      socket.broadcast.emit('player_join', {x: player.x, y: player.y, color: player.color, id: id});
      socket.emit('assign_id', {id: id});

      let playersData = [];
      for (const player of players.values()) {
        if (player.id != socket.id) playersData.push(player);
      }
      socket.emit('send_players', {playerData: playersData});
    })

    socket.on('disconnect', () => {
      let id = socket.id;
      socket.broadcast.emit('player_leave', id);
      players.delete(id);
    })

  });
}

http.listen(port, () => {
  console.log(`App is listening on port: ${port}`);
  registerSocketServer();
})
