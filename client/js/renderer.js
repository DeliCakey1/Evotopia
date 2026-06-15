class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.scale = 2.0;
  }

  screenToWorldX(sx) {
    return (sx - this.canvas.width / 2) / this.scale + this.x;
  }

  screenToWorldY(sy) {
    return (sy - this.canvas.height / 2) / this.scale + this.y;
  }

  worldToScreenX(wx) {
    return (wx - this.x) * this.scale + this.canvas.width / 2;
  }

  worldToScreenY(wy) {
    return (wy - this.y) * this.scale + this.canvas.height / 2;
  }

  get scaleSize() {
    return this.scale;
  }
}

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = new Camera(canvas);
    this.smoothX = 0;
    this.smoothY = 0;
    this.smoothScale = 2.0;
    this.bgCanvas = null;
    this.bgPattern = null;
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.buildBackground();
  }

  buildBackground() {
    const w = 128;
    const h = 128;
    this.bgCanvas = document.createElement('canvas');
    this.bgCanvas.width = w;
    this.bgCanvas.height = h;
    const bg = this.bgCanvas.getContext('2d');

    bg.fillStyle = '#2d5a1e';
    bg.fillRect(0, 0, w, h);

    for (let i = 0; i < 60; i++) {
      const gx = Math.random() * w;
      const gy = Math.random() * h;
      const shade = 30 + Math.random() * 25;
      bg.fillStyle = 'rgba(' + shade + ',' + (shade + 60) + ',' + (shade + 10) + ',0.3)';
      bg.fillRect(gx, gy, 2 + Math.random() * 3, 1 + Math.random() * 2);
    }

    for (let i = 0; i < 8; i++) {
      const gx = Math.random() * w;
      const gy = Math.random() * h;
      bg.fillStyle = 'rgba(60, 120, 40, 0.15)';
      bg.beginPath();
      bg.arc(gx, gy, 8 + Math.random() * 16, 0, Math.PI * 2);
      bg.fill();
    }
  }

  updateCamera(followX, followY, playerSize) {
    const targetScale = Math.max(1.2, 2.5 - (playerSize - 14) * 0.025);
    this.smoothScale += (targetScale - this.smoothScale) * 0.08;

    const targetX = followX;
    const targetY = followY;
    this.smoothX += (targetX - this.smoothX) * 0.1;
    this.smoothY += (targetY - this.smoothY) * 0.1;

    this.camera.x = this.smoothX;
    this.camera.y = this.smoothY;
    this.camera.scale = this.smoothScale;
  }

  render(state, myId, mapWidth, mapHeight) {
    const ctx = this.ctx;
    const cam = this.camera;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#1a3a10';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(cam.scale, cam.scale);
    ctx.translate(-cam.x, -cam.y);

    this.drawBackground(ctx, mapWidth, mapHeight);

    if (state.foods) {
      for (const food of state.foods) {
        this.drawFood(ctx, food);
      }
    }

    if (state.players) {
      for (const p of state.players) {
        if (p.id === myId) {
          this.drawPlayer(ctx, p, true);
        } else {
          this.drawPlayer(ctx, p, false);
        }
      }
    }

    ctx.restore();
  }

  drawBackground(ctx, mapWidth, mapHeight) {
    ctx.fillStyle = '#2d5a1e';
    ctx.fillRect(-100, -100, mapWidth + 200, mapHeight + 200);

    const cam = this.camera;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const startX = Math.floor(cam.x - w / 2 / cam.scale - 50);
    const startY = Math.floor(cam.y - h / 2 / cam.scale - 50);
    const endX = Math.ceil(cam.x + w / 2 / cam.scale + 50);
    const endY = Math.ceil(cam.y + h / 2 / cam.scale + 50);

    if (this.bgCanvas) {
      const bw = this.bgCanvas.width;
      const bh = this.bgCanvas.height;
      for (let bx = startX; bx < endX; bx += bw) {
        for (let by = startY; by < endY; by += bh) {
          ctx.drawImage(this.bgCanvas, bx, by, bw, bh);
        }
      }
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    const gridSize = 100;
    const gStartX = Math.max(0, Math.floor(startX / gridSize) * gridSize);
    const gStartY = Math.max(0, Math.floor(startY / gridSize) * gridSize);
    for (let gx = gStartX; gx <= Math.min(endX, mapWidth); gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, Math.max(0, startY));
      ctx.lineTo(gx, Math.min(endY, mapHeight));
      ctx.stroke();
    }
    for (let gy = gStartY; gy <= Math.min(endY, mapHeight); gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(Math.max(0, startX), gy);
      ctx.lineTo(Math.min(endX, mapWidth), gy);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255,50,50,0.3)';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, mapWidth, mapHeight);
  }

  drawFood(ctx, food) {
    ctx.save();
    ctx.translate(food.x, food.y);
    ctx.globalAlpha = 0.9;

    const s = food.size;

    ctx.fillStyle = food.color;
    ctx.shadowColor = food.color;
    ctx.shadowBlur = 4;

    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(-s * 0.25, -s * 0.25, s * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawPlayer(ctx, p, isMe) {
    const s = p.size;
    const a = p.angle;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(a);

    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;

    this.drawAnimalShape(ctx, p, s);

    ctx.shadowBlur = 0;

    ctx.rotate(-a);
    ctx.translate(-p.x, -p.y);

    if (isMe) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, s + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold ' + Math.max(10, s * 0.9) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(p.name, p.x, p.y - s - 4);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  drawAnimalShape(ctx, p, s) {
    const bodyColor = p.color;
    const darker = this.darken(bodyColor, 0.75);
    const lighter = this.lighten(bodyColor, 1.2);

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = lighter;
    ctx.beginPath();
    ctx.arc(-s * 0.15, -s * 0.2, s * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s * 0.3, -s * 0.25, s * 0.22, 0, Math.PI * 2);
    ctx.arc(-s * 0.3, -s * 0.25, s * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(s * 0.35, -s * 0.2, s * 0.1, 0, Math.PI * 2);
    ctx.arc(-s * 0.25, -s * 0.2, s * 0.1, 0, Math.PI * 2);
    ctx.fill();

    const tierName = p.tierName || '';
    if (tierName === 'Mouse' || tierName === 'Rabbit') {
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(s * 0.7, -s * 0.5, s * 0.2, s * 0.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-s * 0.7, -s * 0.5, s * 0.2, s * 0.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (tierName === 'Fox') {
      ctx.fillStyle = darker;
      ctx.beginPath();
      ctx.moveTo(s * 0.8, -s * 0.3);
      ctx.lineTo(s * 1.2, -s * 0.6);
      ctx.lineTo(s * 0.7, -s * 0.6);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s * 0.8, -s * 0.3);
      ctx.lineTo(-s * 1.2, -s * 0.6);
      ctx.lineTo(-s * 0.7, -s * 0.6);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(s * 0.8, -s * 0.3);
      ctx.lineTo(s * 1.0, -s * 0.55);
      ctx.lineTo(s * 0.6, -s * 0.55);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s * 0.8, -s * 0.3);
      ctx.lineTo(-s * 1.0, -s * 0.55);
      ctx.lineTo(-s * 0.6, -s * 0.55);
      ctx.fill();
    }

    if (tierName === 'Wolf') {
      ctx.fillStyle = '#ddd';
      ctx.beginPath();
      ctx.arc(s * 0.35, -s * 0.15, s * 0.08, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-s * 0.35, -s * 0.15, s * 0.08, 0, Math.PI);
      ctx.fill();
    }

    if (tierName === 'Dragon') {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(s * 0.1, -s * 0.4);
      ctx.lineTo(s * 0.9, -s * 0.9);
      ctx.lineTo(s * 0.4, -s * 0.1);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, -s * 0.4);
      ctx.lineTo(-s * 0.9, -s * 0.9);
      ctx.lineTo(-s * 0.4, -s * 0.1);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  darken(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 'rgb(' + Math.floor(r * factor) + ',' + Math.floor(g * factor) + ',' + Math.floor(b * factor) + ')';
  }

  lighten(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + Math.min(255, Math.floor(r * factor)) + ',' + Math.min(255, Math.floor(g * factor)) + ',' + Math.min(255, Math.floor(b * factor)) + ',0.4)';
  }
}
