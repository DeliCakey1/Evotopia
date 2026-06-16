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
    { name: 'Sparrow', xpToNext: 15 },
    { name: 'Crow',    xpToNext: 40 },
    { name: 'Hawk',    xpToNext: 80 },
    { name: 'Eagle',   xpToNext: 150 },
    { name: 'Phoenix', xpToNext: 300 },
    { name: 'Dragon',  xpToNext: -1 },
  ];

  const network = new Network();
  const input = new Input();
  const renderer = new Renderer(canvas);

  let myId = null;
  let mapWidth = 4000;
  let mapHeight = 4000;
  let lastState = { players: [], foods: [] };
  let myPlayer = null;
  let connected = false;
  let joined = false;
  let lastInputTime = 0;
  let pendingJoin = false;

  const wsProto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const serverHost = wsProto + '//' + location.host;

  function connect() {
    network.connect(serverHost);
  }

  network.on('connected', () => {
    connected = true;
    if (pendingJoin) {
      pendingJoin = false;
      const name = nameInput.value.trim() || 'Player';
      network.join(name);
    }
  });

  network.on('disconnected', () => {
    connected = false;
    joined = false;
    pendingJoin = false;
    myId = null;
    myPlayer = null;
    startScreen.classList.remove('hidden');
    hud.classList.add('hidden');
    leaderboard.classList.add('hidden');
    playBtn.textContent = 'Play';
    playBtn.disabled = false;
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

      if (input.shouldSend()) {
        network.sendInput(input.dx, input.dy);
        input.markSent();
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
    if (joined) return;
    if (!connected) {
      pendingJoin = true;
      connect();
      playBtn.textContent = 'Connecting...';
      playBtn.disabled = true;
    } else {
      const name = nameInput.value.trim() || 'Player';
      network.join(name);
    }
  });

  window.addEventListener('resize', onResize);
  onResize();

  requestAnimationFrame(gameLoop);
})();
