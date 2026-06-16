(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const nameInput = document.getElementById('nameInput');
  const playBtn = document.getElementById('playBtn');
  const startScreen = document.getElementById('startScreen');
  const hud = document.getElementById('hud');
  const tierDisplay = document.getElementById('tierDisplay');
  const xpBar = document.getElementById('xpBar');
  const xpText = document.getElementById('xpText');
  const leaderboard = document.getElementById('leaderboard');
  const leaderboardList = document.getElementById('leaderboardList');

  const EVOLUTION_TIERS = [
    { name: 'Worm',     xpToNext: 15 },
    { name: 'Mouse',    xpToNext: 40 },
    { name: 'Rabbit',   xpToNext: 80 },
    { name: 'Fox',      xpToNext: 150 },
    { name: 'Wolf',     xpToNext: 250 },
    { name: 'Bear',     xpToNext: 400 },
    { name: 'Dragon',   xpToNext: -1 },
  ];

  const network = new Network();
  const input = new Input(canvas);
  const renderer = new Renderer(canvas);

  let myId = null;
  let mapWidth = 4000;
  let mapHeight = 4000;
  let lastState = { players: [], foods: [] };
  let myPlayer = null;
  let connected = false;
  let joined = false;
  let lastInputTime = 0;

  const wsProto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const serverHost = wsProto + '//' + location.hostname + ':' + location.port;

  function connect() {
    network.connect(serverHost);
  }

  network.on('connected', () => {
    connected = true;
    const name = nameInput.value.trim() || 'Player';
    network.join(name);
  });

  network.on('disconnected', () => {
    connected = false;
    joined = false;
    myId = null;
    myPlayer = null;
    startScreen.classList.remove('hidden');
    hud.classList.add('hidden');
    leaderboard.classList.add('hidden');
  });

  network.on('init', (msg) => {
    myId = msg.id;
    mapWidth = msg.mapWidth;
    mapHeight = msg.mapHeight;
    joined = true;
    startScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    leaderboard.classList.remove('hidden');
  });

  network.on('state', (msg) => {
    if (!joined) return;
    lastState = msg;

    if (msg.players) {
      for (const p of msg.players) {
        if (p.id === myId) {
          myPlayer = p;
          break;
        }
      }
    }

    if (msg.evolves && msg.evolves.length > 0) {
      for (const ev of msg.evolves) {
        if (ev.playerId === myId) {
          showEvolveNotification(ev.tierName);
        }
      }
    }
  });

  function showEvolveNotification(tierName) {
    const el = document.getElementById('tierDisplay');
    el.style.transition = 'none';
    el.style.transform = 'scale(1.5)';
    el.style.color = '#FFD700';
    setTimeout(() => {
      el.style.transition = 'all 0.3s';
      el.style.transform = 'scale(1)';
      el.style.color = '#ddd';
    }, 50);
  }

  function updateHUD() {
    if (myPlayer) {
      tierDisplay.textContent = myPlayer.tierName;
      if (myPlayer.xpToNext > 0) {
        const pct = Math.min(100, (myPlayer.xp / myPlayer.xpToNext) * 100);
        xpBar.style.width = pct + '%';
        xpText.textContent = myPlayer.xp + ' / ' + myPlayer.xpToNext + ' XP';
      } else {
        xpBar.style.width = '100%';
        xpText.textContent = 'MAX LEVEL';
        xpBar.style.background = 'linear-gradient(90deg, #FFD700, #FF6B35)';
      }
    }
  }

  function updateLeaderboard() {
    if (!lastState.players) return;
    const sorted = lastState.players.slice().sort((a, b) => {
      if (a.tier !== b.tier) return b.tier - a.tier;
      return b.xp - a.xp;
    });

    let html = '';
    const top = sorted.slice(0, 10);
    for (let i = 0; i < top.length; i++) {
      const p = top[i];
      const isMe = p.id === myId;
      html += '<div class="lb-entry' + (isMe ? ' me' : '') + '">' +
        '<span class="lb-rank">' + (i + 1) + '.</span>' +
        '<span class="lb-name">' + escapeHtml(p.name) + '</span>' +
        '<span class="lb-tier">' + p.tierName + '</span>' +
        '</div>';
    }
    leaderboardList.innerHTML = html;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function gameLoop() {
    if (joined) {
      if (myPlayer) {
        renderer.updateCamera(myPlayer.x, myPlayer.y, myPlayer.size);
      }
      renderer.render(lastState, myId, mapWidth, mapHeight);
      updateHUD();
      updateLeaderboard();

      input.updateWorldCoords(renderer.camera);
      const now = Date.now();
      if (now - lastInputTime > 30 && input.shouldSend()) {
        network.sendInput(input.mouseWorldX, input.mouseWorldY);
        input.markSent();
        lastInputTime = now;
      }
    }
    requestAnimationFrame(gameLoop);
  }

  function onResize() {
    renderer.resize();
  }

  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      playBtn.click();
    }
  });

  playBtn.addEventListener('click', () => {
    if (!connected) {
      connect();
      playBtn.textContent = 'Connecting...';
      playBtn.disabled = true;
      setTimeout(() => {
        playBtn.textContent = 'Play';
        playBtn.disabled = false;
      }, 3000);
    } else if (!joined) {
      const name = nameInput.value.trim() || 'Player';
      network.join(name);
    }
  });

  window.addEventListener('resize', onResize);
  onResize();

  requestAnimationFrame(gameLoop);

  setTimeout(() => {
    if (!connected) connect();
  }, 500);
})();
