class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.scale = 1.5;
  }

  worldToScreenX(wx) {
    return (wx - this.x) * this.scale + this.canvas.width / 2;
  }

  worldToScreenY(wy) {
    return (wy - this.y) * this.scale + this.canvas.height / 2;
  }
}

class SpriteLoader {
  constructor() {
    this.images = {};
  }

  loadAll(callback) {
    const sprites = {
      'sparrow': 'sprites/sparrow.svg',
      'robin': 'sprites/robin.svg',
      'crow': 'sprites/crow.svg',
      'falcon': 'sprites/falcon.svg',
      'hawk': 'sprites/hawk.svg',
      'vulture': 'sprites/vulture.svg',
      'eagle': 'sprites/eagle.svg',
      'phoenix': 'sprites/phoenix.svg',
      'dragon': 'sprites/dragon.svg',
      'insect': 'sprites/insect.svg',
      'berry': 'sprites/berry.svg',
      'star': 'sprites/star.svg',
      'orb': 'sprites/orb.svg',
      'cloud': 'sprites/cloud.svg',
      'tree': 'sprites/tree.svg',
      'bush': 'sprites/bush.svg',
    };

    const names = Object.keys(sprites);
    let loaded = 0;

    for (const name of names) {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded >= names.length) callback();
      };
      img.onerror = () => {
        console.warn('Failed to load sprite:', name);
        loaded++;
        if (loaded >= names.length) callback();
      };
      img.src = sprites[name];
      this.images[name] = img;
    }
  }

  get(name) {
    return this.images[name] || null;
  }
}

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = new Camera(canvas);
    this.smoothX = 0;
    this.smoothY = 0;
    this.smoothScale = 1.5;
    this.clouds = [];
    this.trees = [];
    this.smoothPlayers = {};
    this.sprites = new SpriteLoader();
    this.spritesReady = false;

    this.sprites.loadAll(() => {
      this.spritesReady = true;
    });

    this.initClouds();
  }

  setTrees(treeData) {
    this.trees = treeData || [];
  }

  initClouds() {
    for (let i = 0; i < 25; i++) {
      this.clouds.push({
        x: Math.random() * 6500 - 250,
        y: 100 + Math.random() * 1800,
        speed: 0.06 + Math.random() * 0.15,
        opacity: 0.15 + Math.random() * 0.25,
        scale: 0.5 + Math.random() * 0.8,
      });
    }
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  updateCamera(followX, followY, playerSize) {
    const targetScale = Math.max(0.9, 1.5 - (playerSize - 16) * 0.015);
    this.smoothScale += (targetScale - this.smoothScale) * 0.05;
    this.smoothX += (followX - this.smoothX) * 0.12;
    this.smoothY += (followY - this.smoothY) * 0.12;
    this.camera.x = this.smoothX;
    this.camera.y = this.smoothY;
    this.camera.scale = this.smoothScale;
  }

  render(state, myId, mapWidth, mapHeight) {
    const { ctx, camera: cam } = this;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.drawSky(ctx, cam, w, h, mapHeight);
    this.drawStars(ctx, w, h, cam.y, mapHeight);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(cam.scale, cam.scale);
    ctx.translate(-cam.x, -cam.y);

    this.drawClouds(ctx, cam.y, mapHeight);
    this.drawMapBorders(ctx, mapWidth, mapHeight);

    if (state.foods) {
      for (const food of state.foods) {
        this.drawFood(ctx, food);
      }
    }

    if (state.players) {
      this.updateSmoothPlayers(state.players, myId);
      for (const p of state.players) {
        const smooth = this.smoothPlayers[p.id];
        if (smooth) {
          this.drawPlayer(ctx, { ...p, x: smooth.x, y: smooth.y }, p.id === myId);
        }
      }
    }

    ctx.restore();
  }

  updateSmoothPlayers(players, myId) {
    for (const p of players) {
      if (!this.smoothPlayers[p.id]) {
        this.smoothPlayers[p.id] = { x: p.x, y: p.y };
      } else {
        const sp = this.smoothPlayers[p.id];
        const lerp = p.id === myId ? 0.5 : 0.3;
        sp.x += (p.x - sp.x) * lerp;
        sp.y += (p.y - sp.y) * lerp;
      }
    }
    for (const id in this.smoothPlayers) {
      if (!players.find(p => p.id === parseInt(id))) {
        delete this.smoothPlayers[id];
      }
    }
  }

  getWorldColor(worldY, mapHeight) {
    const t = Math.max(0, Math.min(1, worldY / mapHeight));
    const r = Math.round(8 + t * 170);
    const g = Math.round(10 + t * 215);
    const b = Math.round(42 + t * 218);
    return { r, g, b };
  }

  drawSky(ctx, cam, w, h, mapHeight) {
    const halfH = h / 2 / cam.scale;
    const topWorld = Math.max(0, cam.y - halfH);
    const botWorld = Math.min(mapHeight, cam.y + halfH);
    const top = this.getWorldColor(topWorld, mapHeight);
    const bot = this.getWorldColor(botWorld, mapHeight);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgb(' + top.r + ',' + top.g + ',' + top.b + ')');
    grad.addColorStop(1, 'rgb(' + bot.r + ',' + bot.g + ',' + bot.b + ')');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  drawStars(ctx, w, h, camY, mapHeight) {
    const starAlpha = Math.max(0, Math.min(1, (mapHeight - camY - 200) / 1200));
    if (starAlpha < 0.01) return;

    for (let i = 0; i < 100; i++) {
      const sx = ((i * 137.5 + 53.3) % w);
      const sy = ((i * 97.3 + 21.7) % (h * 0.55));
      const size = 0.4 + (i % 4) * 0.4;
      const twinkle = 0.4 + 0.6 * Math.sin(Date.now() * 0.001 + i * 2.7);
      const a = starAlpha * twinkle * (0.5 + (i % 5) * 0.1);

      ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawClouds(ctx, camY, mapHeight) {
    const fade = Math.max(0, Math.min(1, (mapHeight - camY - 100) / 1400));
    if (fade < 0.01) return;

    const cloudImg = this.sprites.get('cloud');
    if (!cloudImg) return;

    for (const c of this.clouds) {
      c.x += c.speed;
      if (c.x > 6500) c.x = -250;

      const a = c.opacity * fade;
      if (a < 0.01) continue;

      ctx.globalAlpha = a;
      const cw = 100 * c.scale;
      const ch = 60 * c.scale;
      ctx.drawImage(cloudImg, c.x - cw / 2, c.y - ch / 2, cw, ch);
    }
    ctx.globalAlpha = 1;
  }

  drawMapBorders(ctx, mapWidth, mapHeight) {
    ctx.strokeStyle = 'rgba(255,100,100,0.08)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(0, 0, mapWidth, mapHeight);
    ctx.setLineDash([]);

    const groundY = mapHeight - 45;
    const grad = ctx.createLinearGradient(0, groundY - 40, 0, mapHeight);
    grad.addColorStop(0, 'rgba(30,140,50,0)');
    grad.addColorStop(0.3, 'rgba(30,140,50,0.25)');
    grad.addColorStop(0.7, 'rgba(20,100,35,0.4)');
    grad.addColorStop(1, 'rgba(15,60,25,0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, groundY - 40, mapWidth, mapHeight - groundY + 40);

    for (let i = 0; i < mapWidth; i += 6) {
      const h = groundY - 3 - Math.sin(i * 0.012) * 12 - Math.sin(i * 0.025) * 5 - Math.sin(i * 0.04) * 3;
      ctx.fillStyle = 'rgba(40,160,60,' + (0.12 + Math.sin(i * 0.015) * 0.06 + 0.06) + ')';
      ctx.fillRect(i, h, 6, groundY - h);
    }

    const treeImg = this.sprites.get('tree');
    if (treeImg) {
      for (const t of this.trees) {
        const baseY = groundY - 2 - Math.sin(t.x * 0.012) * 12 - Math.sin(t.x * 0.025) * 5;
        const drawW = t.canopyWidth * 1.3;
        const drawH = t.height * 1.15;
        ctx.drawImage(treeImg, t.x - drawW / 2, baseY - drawH, drawW, drawH);
      }
    }
  }

  drawFood(ctx, food) {
    const s = food.size * 2;
    const img = this.sprites.get(food.type);
    if (img) {
      ctx.save();
      ctx.translate(food.x, food.y);
      ctx.shadowColor = food.color;
      ctx.shadowBlur = 8;
      ctx.drawImage(img, -s / 2, -s / 2, s, s);
      ctx.shadowBlur = 0;
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(food.x, food.y);
      ctx.shadowColor = food.color;
      ctx.shadowBlur = 6;
      ctx.fillStyle = food.color;
      ctx.beginPath();
      ctx.arc(0, 0, food.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  drawPlayer(ctx, p, isMe) {
    const img = this.sprites.get(p.tierName.toLowerCase());
    const s = p.size;

    ctx.save();
    ctx.translate(p.x, p.y);
    if (!p.facingRight) ctx.scale(-1, 1);
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;

    if (img) {
      const w = s * 2.5;
      const h = s * 2.5;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.restore();

    if (isMe) {
      const hw = s * 1.2;
      const hh = s * 0.7;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p.x - hw, p.y - hh, hw * 2, hh * 2);
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold ' + Math.max(10, s * 0.7) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 3;
    ctx.fillText(p.name, p.x, p.y - s - 6);
    ctx.shadowBlur = 0;
  }
}
