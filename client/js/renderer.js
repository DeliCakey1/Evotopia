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
      'seed': 'sprites/seed.svg',
      'worm': 'sprites/worm.svg',
      'prey': 'sprites/prey.svg',
      'fish': 'sprites/fish.svg',
      'carrion': 'sprites/carrion.svg',
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
    this.bushes = [];
    this.waterZones = [];
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

  setBushes(bushData) {
    this.bushes = bushData || [];
  }

  setWaterZones(zoneData) {
    this.waterZones = zoneData || [];
  }

  initClouds() {
    for (let i = 0; i < 40; i++) {
      this.clouds.push({
        x: Math.random() * 12500 - 250,
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

  render(state, myId, mapWidth, mapHeight, myPlayer) {
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
    this.drawWaterZones(ctx, cam.y, mapHeight);
    this.drawBushes(ctx, mapHeight);

    if (state.foods && myPlayer) {
      for (const food of state.foods) {
        this.drawFood(ctx, food, myPlayer);
      }
    }

    if (state.players && myPlayer) {
      this.updateSmoothPlayers(state.players, myId);
      for (const p of state.players) {
        const smooth = this.smoothPlayers[p.id];
        if (smooth) {
          this.drawPlayer(ctx, { ...p, x: smooth.x, y: smooth.y }, p.id === myId, myPlayer);
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
      if (c.x > 12500) c.x = -250;

      const a = c.opacity * fade;
      if (a < 0.01) continue;

      ctx.globalAlpha = a;
      const cw = 100 * c.scale;
      const ch = 60 * c.scale;
      ctx.drawImage(cloudImg, c.x - cw / 2, c.y - ch / 2, cw, ch);
    }
    ctx.globalAlpha = 1;
  }

  drawWaterZones(ctx, camY, mapHeight) {
    const waterAlpha = Math.max(0, Math.min(1, 1 - (mapHeight - camY - 100) / 600));
    if (waterAlpha < 0.01) return;

    const now = Date.now() * 0.001;
    for (const z of this.waterZones) {
      const surfaceY = z.y;
      const bottomY = z.y + z.h;

      const grad = ctx.createLinearGradient(z.x, surfaceY, z.x, bottomY);
      grad.addColorStop(0, 'rgba(60,130,200,' + (0.55 * waterAlpha) + ')');
      grad.addColorStop(0.5, 'rgba(40,100,180,' + (0.35 * waterAlpha) + ')');
      grad.addColorStop(1, 'rgba(30,80,150,' + (0.2 * waterAlpha) + ')');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(z.x, surfaceY);
      for (let wx = z.x; wx <= z.x + z.w; wx += 6) {
        const wy = this.getTerrainY(wx, mapHeight);
        ctx.lineTo(wx, Math.min(wy, bottomY));
      }
      ctx.lineTo(z.x + z.w, surfaceY);
      ctx.closePath();
      ctx.fill();

      for (let i = 0; i < 4; i++) {
        const rx = z.x + 10 + ((i * 41 + 17 + Math.sin(now + i * 1.7) * 6) % Math.max(1, z.w - 20));
        const ry = surfaceY + 6 + i * (z.h - 12) / 3 + Math.sin(now * 1.3 + i * 0.9) * 3;
        ctx.strokeStyle = 'rgba(180,220,255,' + (0.18 * waterAlpha) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(rx, ry, 12 + Math.sin(now + i) * 3, 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  drawBushes(ctx, mapHeight) {
    const bushImg = this.sprites.get('bush');
    if (!bushImg) return;

    for (const b of this.bushes) {
      const s = 0.7 + ((b.x * 7.3 + b.x * b.x * 0.01) % 0.3);
      const by = this.getTerrainY(b.x, mapHeight);
      ctx.drawImage(bushImg, b.x - 10 * s, by - 18 * s, 20 * s, 36 * s);
    }
  }

  getTerrainY(x, mapHeight) {
    const groundY = mapHeight - 200;
    let y = groundY - Math.sin(x * 0.012) * 12 - Math.sin(x * 0.025) * 5 - Math.sin(x * 0.04) * 3;
    for (const z of this.waterZones) {
      const cx = z.x + z.w / 2;
      const dist = Math.abs(x - cx);
      const halfW = z.w / 2 + 25;
      if (dist < halfW) {
        const t = dist / halfW;
        y += Math.max(0, (1 - t * t)) * z.depth;
      }
    }
    return y;
  }

  drawMapBorders(ctx, mapWidth, mapHeight) {
    const step = 6;
    const groundY = mapHeight - 200;

    ctx.strokeStyle = 'rgba(255,80,80,0.12)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(0, 0, mapWidth, mapHeight);
    ctx.setLineDash([]);

    // Build terrain points
    const pts = [];
    for (let i = 0; i <= mapWidth; i += step) {
      pts.push({ x: i, y: this.getTerrainY(i, mapHeight) });
    }

    // Grass fill with gradient following terrain
    const grad = ctx.createLinearGradient(0, 0, 0, mapHeight);
    grad.addColorStop(0, 'rgba(30,140,50,0)');
    grad.addColorStop(0.3, 'rgba(30,140,50,0.25)');
    grad.addColorStop(0.7, 'rgba(20,100,35,0.4)');
    grad.addColorStop(1, 'rgba(15,60,25,0.55)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, mapHeight);
    for (const p of pts) ctx.lineTo(p.x, p.y);
    ctx.lineTo(mapWidth, mapHeight);
    ctx.closePath();
    ctx.fill();

    for (const p of pts) {
      if (p.y <= groundY) {
        ctx.fillStyle = 'rgba(40,160,60,' + (0.12 + Math.sin(p.x * 0.015) * 0.06 + 0.06) + ')';
        ctx.fillRect(p.x, p.y, step, groundY - p.y);
      }
    }

    // Trees on terrain
    const treeImg = this.sprites.get('tree');
    if (treeImg) {
      for (const t of this.trees) {
        const baseY = this.getTerrainY(t.x, mapHeight);
        const drawW = t.canopyWidth * 1.3;
        const drawH = t.height * 1.15;
        ctx.drawImage(treeImg, t.x - drawW / 2, baseY - drawH, drawW, drawH);
      }
    }
  }

  isFoodEdible(food, myPlayer) {
    const TIER_EATS = [
      ['insect','berry','seed'],
      ['insect','berry','worm'],
      ['insect','seed','berry','worm','carrion','prey'],
      ['prey'],
      ['prey','carrion'],
      ['carrion'],
      ['prey','fish','carrion'],
      ['insect','berry','seed','worm','prey','fish','carrion','star','orb'],
      ['insect','berry','seed','worm','prey','fish','carrion','star','orb'],
    ];
    const eats = TIER_EATS[myPlayer.tier];
    if (!eats) return true;
    return eats.includes(food.type);
  }

  drawFood(ctx, food, myPlayer) {
    const s = food.size * 2;
    const edible = this.isFoodEdible(food, myPlayer);
    const img = this.sprites.get(food.type);
    ctx.save();
    ctx.translate(food.x, food.y);

    if (edible) {
      ctx.strokeStyle = 'rgba(50,220,80,0.7)';
      ctx.lineWidth = 1.5;
      const pad = 3;
      ctx.strokeRect(-s / 2 - pad, -s / 2 - pad, s + pad * 2, s + pad * 2);
    }

    ctx.shadowColor = food.color;
    ctx.shadowBlur = edible ? 12 : 8;

    if (img) {
      ctx.drawImage(img, -s / 2, -s / 2, s, s);
    } else {
      ctx.fillStyle = food.color;
      ctx.beginPath();
      ctx.arc(0, 0, food.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  drawPlayer(ctx, p, isMe, myPlayer) {
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

    if (!isMe && myPlayer) {
      const hw = s * 1.2;
      const hh = s * 0.7;
      if (p.tier > myPlayer.tier) {
        ctx.strokeStyle = 'rgba(255,50,50,0.8)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(255,50,50,0.5)';
        ctx.shadowBlur = 10;
        ctx.strokeRect(p.x - hw - 4, p.y - hh - 4, hw * 2 + 8, hh * 2 + 8);
        ctx.shadowBlur = 0;
      } else if (p.tier < myPlayer.tier) {
        ctx.strokeStyle = 'rgba(50,220,80,0.7)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(50,220,80,0.4)';
        ctx.shadowBlur = 10;
        ctx.strokeRect(p.x - hw - 4, p.y - hh - 4, hw * 2 + 8, hh * 2 + 8);
        ctx.shadowBlur = 0;
      }
    }

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