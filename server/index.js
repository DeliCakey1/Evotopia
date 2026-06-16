const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const { TICK_RATE, MAP_WIDTH, MAP_HEIGHT } = require('./config');
const Game = require('./game');
const Player = require('./player');

const PORT = process.env.PORT || 3001;
const CLIENT_DIR = path.join(__dirname, '..', 'client');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(CLIENT_DIR, filePath);

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });
const game = new Game();

console.log('Evotopia server starting on http://localhost:' + PORT);
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
          player.setDirection(msg.dx, msg.dy);
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

server.listen(PORT);
