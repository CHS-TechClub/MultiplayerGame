const c = document.getElementById("canvas");
const ctx = c.getContext("2d");
const socket = io();
const players = new Map();
const pressedKeys = [];
let mainPlayer;

/*
Data class for players
*/
class Player {
  constructor(x, y, color, id) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.id = id;
    this.width = 50;
    this.height = 50;
  }

  getX() {
    return this.x;
  }

  setX(x) {
    this.x = x;
  }

  addX(x) {
    this.x += x;
    if (this.x < 0) this.setX(0);
    if (this.x > c.width - this.getWidth()) this.setX(c.width - this.getWidth());
    socket.emit("player_move", {x: this.getX(), y: this.getY()});
  }

  getY() {
    return this.y;
  }

  setY(y) {
    this.y = y;
  }

  addY(y) {
    this.y += y;
    if (this.y < 0) this.setY(0);
    if (this.y > c.height - this.getHeight()) this.setY(c.height - this.getHeight());
    socket.emit("player_move", {x: this.getX(), y: this.getY()});
  }

  getColor() {
    return this.color;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getId() {
    return this.id;
  }

  setId(id) {
    this.id = id;
  }

  render(ctx) {
    ctx.beginPath();

    //border
    ctx.fillStyle = "black";
    ctx.fillRect(this.getX() - 2, this.getY() - 2, this.getWidth() + 4, this.getHeight() + 4); //subtract 2 for the left and top, add 4 to counter act the subtraction of 2

    //player
    ctx.fillStyle = this.getColor();
    ctx.fillRect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
    ctx.stroke();
  }

}

/*
Initialize everything
*/
let colors = ["red", "green", "blue", "yellow", "white", "pink", "orange"];
//null id because it gets assigned by the server!
mainPlayer = new Player(Math.floor(Math.random() * (750 - 60 + 1) + 60), Math.floor(Math.random() * (750 - 60 + 1) + 60), colors[Math.floor(Math.random() * colors.length)], null)

/*
Handle main player movement
*/
document.addEventListener('keydown', (event) => {
  if (pressedKeys.includes(event.keyCode)) return;
  pressedKeys.push(event.keyCode);
});

document.addEventListener('keyup', (event) => {
  if (!pressedKeys.includes(event.keyCode)) return;
  let index = pressedKeys.indexOf(event.keyCode);
  if (index > -1) {
    pressedKeys.splice(index, 1)
  }
});

/*
Main game loop
*/
setInterval(() => {
  ctx.clearRect(0, 0, c.width, c.height);

  //don't use else if here to allow for diagnal movement.

  if (pressedKeys.includes(87) || pressedKeys.includes(38)) {
    //W & up arrow
    mainPlayer.addY(-5);
  }

  if (pressedKeys.includes(65) || pressedKeys.includes(37)) {
    //A && left arrow
    mainPlayer.addX(-5);
  }

  if (pressedKeys.includes(83) || pressedKeys.includes(40)) {
    //S && down arrow
    mainPlayer.addY(5);
  }

  if (pressedKeys.includes(68) || pressedKeys.includes(39)) {
    //D && right arrow
    mainPlayer.addX(5);
  }

  for (const player of players.values()) {
    player.render(ctx);
  }
}, 20);

/*
Socket Stuff
*/
socket.on('connect', () => {
  socket.emit('join_game', {player: mainPlayer})
})

socket.on('send_players', (data) => {
  for (const player of data.playerData) {
    players.set(player.id, new Player(player.x, player.y, player.color, player.id));
  }
})

socket.on('assign_id', (data) => {
  players.set(data.id, mainPlayer);
  mainPlayer.setId(data.id);
})

socket.on('player_join', (player) => {
  players.set(player.id, new Player(player.x, player.y, player.color, player.id));
})

socket.on('player_leave', (id) => {
  players.delete(id);
})

socket.on('player_move', (player) => {
  let gamePlayer = players.get(player.id);
  gamePlayer.setX(player.x);
  gamePlayer.setY(player.y);
})
