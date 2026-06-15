const { WebSocketServer } = require('ws');
const { TICK_RATE, MAP_WIDTH, MAP_HEIGHT } = require('./config');
const Game = require('./game');
const Player = require('./player');

const PORT = process.env.PORT || 3001;
const wss = new WebSocketServer({ port: PORT });
const game = new Game();

console.log('Evotopia server starting on port ' + PORT);
console.log('Map: ' + MAP_WIDTH + 'x' + MAP_HEIGHT);

wss.on('connection', (ws) => {
  let player = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'join') {
        if (player) return;
        player = new Player(msg.name);
        game.addPlayer(player);

        ws.send(JSON.stringify({
          type: 'init',
          id: player.id,
          mapWidth: MAP_WIDTH,
          mapHeight: MAP_HEIGHT,
        }));

        console.log(player.name + ' joined (id=' + player.id + ', tier=' + player.tierName + ')');
      } else if (msg.type === 'input') {
        if (player && player.alive) {
          player.setTarget(msg.x, msg.y);
        }
      }
    } catch (e) {
      console.error('Message error:', e.message);
    }
  });

  ws.on('close', () => {
    if (player) {
      game.removePlayer(player.id);
      console.log(player.name + ' left (id=' + player.id + ')');
    }
  });

  ws.on('error', () => {});
});

setInterval(() => {
  game.update();
  const state = game.getState();
  const payload = JSON.stringify({ type: 'state', ...state });

  for (const ws of wss.clients) {
    if (ws.readyState === 1) {
      ws.send(payload);
    }
  }
}, TICK_RATE);
