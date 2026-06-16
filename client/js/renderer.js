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

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = new Camera(canvas);
    this.smoothX = 0;
    this.smoothY = 0;
    this.smoothScale = 1.5;
    this.clouds = [];
    this.bgCanvas = null;
    this.initClouds();
  }

  initClouds() {
    for (let i = 0; i < 40; i++) {
      this.clouds.push({
        x: Math.random() * 6000,
        y: Math.random() * 3000 + 200,
        w: 60 + Math.random() * 120,
        h: 20 + Math.random() * 30,
        speed: 0.1 + Math.random() * 0.2,
        opacity: 0.15 + Math.random() * 0.25,
      });
    }
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  updateCamera(followX, followY, playerSize) {
    const targetScale = Math.max(0.8, 1.5 - (playerSize - 16) * 0.015);
    this.smoothScale += (targetScale - this.smoothScale) * 0.05;
    this.smoothX += (followX - this.smoothX) * 0.08;
    this.smoothY += (followY - this.smoothY) * 0.08;
    this.camera.x = this.smoothX;
    this.camera.y = this.smoothY;
    this.camera.scale = this.smoothScale;
  }

  render(state, myId, mapWidth, mapHeight) {
    const { ctx, camera: cam } = this;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.drawSky(ctx, w, h);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(cam.scale, cam.scale);
    ctx.translate(-cam.x, -cam.y);

    this.drawClouds(ctx);
    this.drawMapBorders(ctx, mapWidth, mapHeight);

    if (state.foods) {
      for (const food of state.foods) {
        this.drawFood(ctx, food);
      }
    }

    if (state.players) {
      for (const p of state.players) {
        this.drawPlayer(ctx, p, p.id === myId);
      }
    }

    ctx.restore();
  }

  drawSky(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0b1a3a');
    grad.addColorStop(0.3, '#1a5276');
    grad.addColorStop(0.6, '#5dade2');
    grad.addColorStop(0.85, '#aed6f1');
    grad.addColorStop(1, '#e8f4fd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 60; i++) {
      const sx = Math.random() * w;
      const sy = Math.random() * h * 0.5;
      const sr = 0.5 + Math.random() * 1.5;
      ctx.fillStyle = 'rgba(255,255,255,' + (0.1 + Math.random() * 0.3) + ')';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawClouds(ctx) {
    for (const c of this.clouds) {
      c.x += c.speed;
      if (c.x > 6000 + 200) c.x = -200;

      ctx.globalAlpha = c.opacity;
      ctx.fillStyle = '#ffffff';

      const cx = c.x;
      const cy = c.y;
      const cw = c.w;
      const ch = c.h;

      ctx.beginPath();
      ctx.ellipse(cx, cy, cw * 0.4, ch * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - cw * 0.3, cy + ch * 0.1, cw * 0.35, ch * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + cw * 0.25, cy + ch * 0.05, cw * 0.3, ch * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - cw * 0.1, cy - ch * 0.15, cw * 0.25, ch * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawMapBorders(ctx, mapWidth, mapHeight) {
    ctx.fillStyle = 'rgba(100,180,255,0.08)';
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    ctx.strokeStyle = 'rgba(255,100,100,0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(0, 0, mapWidth, mapHeight);
    ctx.setLineDash([]);

    const groundY = mapHeight - 60;
    const grad = ctx.createLinearGradient(0, groundY, 0, mapHeight);
    grad.addColorStop(0, 'rgba(34,120,50,0)');
    grad.addColorStop(0.3, 'rgba(34,120,50,0.2)');
    grad.addColorStop(1, 'rgba(20,80,30,0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, groundY, mapWidth, 60);

    for (let i = 0; i < mapWidth; i += 8) {
      const hillY = groundY - 5 - Math.sin(i * 0.008) * 8 - Math.sin(i * 0.02) * 4;
      ctx.fillStyle = 'rgba(30,100,40,0.15)';
      ctx.fillRect(i, hillY, 8, groundY - hillY);
    }

    for (let i = 100; i < mapWidth; i += 120 + Math.sin(i * 0.1) * 40) {
      const treeX = i;
      const treeY = groundY - 5 - Math.sin(i * 0.008) * 8 - Math.sin(i * 0.02) * 4;
      ctx.fillStyle = 'rgba(40,80,30,0.2)';
      ctx.beginPath();
      ctx.moveTo(treeX, treeY);
      ctx.lineTo(treeX - 10, treeY + 18);
      ctx.lineTo(treeX + 10, treeY + 18);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(treeX, treeY - 5);
      ctx.lineTo(treeX - 8, treeY + 10);
      ctx.lineTo(treeX + 8, treeY + 10);
      ctx.fill();
    }
  }

  drawFood(ctx, food) {
    ctx.save();
    ctx.translate(food.x, food.y);

    const s = food.size;
    ctx.shadowColor = food.color;
    ctx.shadowBlur = 6;

    if (food.type === 'insect') {
      ctx.fillStyle = food.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, s, s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.ellipse(s * 0.6, -s * 0.2, s * 0.5, s * 0.15, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-s * 0.6, -s * 0.2, s * 0.5, s * 0.15, -0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (food.type === 'star') {
      ctx.fillStyle = food.color;
      this.drawStar(ctx, 0, 0, s, s * 0.4, 5);
    } else if (food.type === 'orb') {
      ctx.fillStyle = food.color;
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(-s * 0.2, -s * 0.2, s * 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = food.color;
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.arc(-s * 0.2, -s * 0.2, s * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  drawStar(ctx, cx, cy, outerR, innerR, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  drawPlayer(ctx, p, isMe) {
    ctx.save();
    ctx.translate(p.x, p.y);

    if (!p.facingRight) {
      ctx.scale(-1, 1);
    }

    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 8;

    this.drawFlyingCreature(ctx, p, p.size);

    ctx.shadowBlur = 0;
    ctx.restore();

    if (isMe) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold ' + Math.max(10, p.size * 0.7) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 3;
    ctx.fillText(p.name, p.x, p.y - p.size - 6);
    ctx.shadowBlur = 0;
  }

  drawFlyingCreature(ctx, p, s) {
    const tierName = p.tierName;
    const color = p.color;

    switch (tierName) {
      case 'Sparrow': this.drawSparrow(ctx, s, color); break;
      case 'Crow': this.drawCrow(ctx, s, color); break;
      case 'Hawk': this.drawHawk(ctx, s, color); break;
      case 'Eagle': this.drawEagle(ctx, s, color); break;
      case 'Phoenix': this.drawPhoenix(ctx, s, color); break;
      case 'Dragon': this.drawDragon(ctx, s, color); break;
      default: this.drawSparrow(ctx, s, color); break;
    }
  }

  drawSparrow(ctx, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(s * 0.4, -s * 0.1);
    ctx.lineTo(s * 0.8, -s * 0.15);
    ctx.lineTo(s * 0.4, -s * 0.5);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(s * 0.4, s * 0.1);
    ctx.lineTo(s * 0.8, s * 0.15);
    ctx.lineTo(s * 0.4, s * 0.5);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, 0);
    ctx.lineTo(-s * 0.8, s * 0.15);
    ctx.lineTo(-s * 0.7, -s * 0.1);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(s * 0.3, -s * 0.05);
    ctx.lineTo(s * 0.6, -s * 0.08);
    ctx.lineTo(s * 0.3, s * 0.05);
    ctx.fill();
  }

  drawCrow(ctx, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(s * 0.35, -s * 0.25);
    ctx.lineTo(s * 0.3, -s * 0.7);
    ctx.lineTo(s * 0.55, -s * 0.3);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(s * 0.35, s * 0.25);
    ctx.lineTo(s * 0.3, s * 0.7);
    ctx.lineTo(s * 0.55, s * 0.3);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, 0);
    ctx.lineTo(-s * 0.75, s * 0.08);
    ctx.lineTo(-s * 0.7, -s * 0.15);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(s * 0.35, -s * 0.08);
    ctx.lineTo(s * 0.65, -s * 0.1);
    ctx.lineTo(s * 0.3, s * 0.05);
    ctx.fill();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(s * 0.2, -s * 0.15, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHawk(ctx, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.darken(color, 0.8);
    ctx.beginPath();
    ctx.moveTo(s * 0.15, -s * 0.2);
    ctx.lineTo(-s * 0.1, -s * 0.75);
    ctx.lineTo(s * 0.4, -s * 0.35);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.15, s * 0.2);
    ctx.lineTo(-s * 0.1, s * 0.75);
    ctx.lineTo(s * 0.4, s * 0.35);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, 0);
    ctx.lineTo(-s * 0.75, s * 0.1);
    ctx.lineTo(-s * 0.65, -s * 0.15);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(s * 0.35, -s * 0.05);
    ctx.lineTo(s * 0.7, -s * 0.08);
    ctx.lineTo(s * 0.35, s * 0.05);
    ctx.fill();

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(s * 0.2, -s * 0.12, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }

  drawEagle(ctx, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.darken(color, 0.8);
    ctx.beginPath();
    ctx.moveTo(s * 0.1, -s * 0.2);
    ctx.lineTo(-s * 0.2, -s * 0.85);
    ctx.lineTo(s * 0.45, -s * 0.35);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.1, s * 0.2);
    ctx.lineTo(-s * 0.2, s * 0.85);
    ctx.lineTo(s * 0.45, s * 0.35);
    ctx.fill();

    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.moveTo(s * 0.2, -s * 0.05);
    ctx.lineTo(s * 0.7, -s * 0.1);
    ctx.lineTo(s * 0.4, 0);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, 0);
    ctx.lineTo(-s * 0.8, s * 0.12);
    ctx.lineTo(-s * 0.7, -s * 0.12);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(s * 0.35, -s * 0.06);
    ctx.lineTo(s * 0.72, -s * 0.1);
    ctx.lineTo(s * 0.35, s * 0.06);
    ctx.fill();

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(s * 0.18, -s * 0.14, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPhoenix(ctx, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FF9944';
    ctx.beginPath();
    ctx.moveTo(s * 0.2, -s * 0.25);
    ctx.lineTo(-s * 0.1, -s * 0.85);
    ctx.lineTo(s * 0.45, -s * 0.3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.2, s * 0.25);
    ctx.lineTo(-s * 0.1, s * 0.85);
    ctx.lineTo(s * 0.45, s * 0.3);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      const ty = -s * 0.35 - i * s * 0.15;
      ctx.fillStyle = i % 2 === 0 ? '#FF6633' : '#FFD700';
      ctx.beginPath();
      ctx.moveTo(s * 0.1, ty);
      ctx.lineTo(-s * 0.45, ty - s * 0.1);
      ctx.lineTo(-s * 0.35, ty + s * 0.05);
      ctx.fill();
    }

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, 0);
    ctx.lineTo(-s * 0.9, s * 0.15);
    ctx.lineTo(-s * 0.75, -s * 0.05);
    ctx.lineTo(-s * 0.9, -s * 0.2);
    ctx.fill();

    for (let i = 0; i < 4; i++) {
      const ty = s * 0.3 + i * s * 0.25;
      ctx.fillStyle = i % 2 === 0 ? '#FF6633' : '#FFD700';
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, ty);
      ctx.quadraticCurveTo(-s * 0.6, ty + s * 0.15, -s * 0.3, ty + s * 0.3);
      ctx.quadraticCurveTo(-s * 0.1, ty + s * 0.1, -s * 0.2, ty);
      ctx.fill();
    }

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(s * 0.4, -s * 0.1);
    ctx.lineTo(s * 0.8, -s * 0.05);
    ctx.lineTo(s * 0.4, s * 0.1);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s * 0.2, -s * 0.15, s * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(s * 0.05, -s * 0.45);
    ctx.lineTo(s * 0.15, -s * 0.65);
    ctx.lineTo(s * 0.25, -s * 0.45);
    ctx.fill();
  }

  drawDragon(ctx, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.darken(color, 0.75);
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.15);
    ctx.lineTo(-s * 0.4, -s * 0.85);
    ctx.lineTo(s * 0.25, -s * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, s * 0.15);
    ctx.lineTo(-s * 0.4, s * 0.85);
    ctx.lineTo(s * 0.25, s * 0.35);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.45, 0);
    ctx.lineTo(-s * 0.9, s * 0.15);
    ctx.lineTo(-s * 0.8, -s * 0.05);
    ctx.lineTo(-s * 0.9, -s * 0.2);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      const ty = s * 0.3 + i * s * 0.2;
      ctx.fillStyle = this.darken(color, 0.7);
      ctx.beginPath();
      ctx.moveTo(-s * 0.15, ty);
      ctx.lineTo(-s * 0.5, ty - s * 0.05);
      ctx.lineTo(-s * 0.4, ty + s * 0.15);
      ctx.lineTo(-s * 0.15, ty + s * 0.05);
      ctx.fill();
    }

    ctx.fillStyle = '#66FF66';
    ctx.beginPath();
    ctx.arc(s * 0.15, -s * 0.15, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(s * 0.15, -s * 0.15, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#66FF66';
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 0.25, s * 0.03, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.darken(color, 0.6);
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.45);
    ctx.lineTo(s * 0.05, -s * 0.6);
    ctx.lineTo(s * 0.15, -s * 0.4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.0, -s * 0.5);
    ctx.lineTo(s * 0.05, -s * 0.7);
    ctx.lineTo(s * 0.2, -s * 0.45);
    ctx.fill();

    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.moveTo(s * 0.4, -s * 0.08);
    ctx.lineTo(s * 0.75, -s * 0.02);
    ctx.lineTo(s * 0.4, s * 0.08);
    ctx.fill();
  }

  darken(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 'rgb(' + Math.floor(r * factor) + ',' + Math.floor(g * factor) + ',' + Math.floor(b * factor) + ')';
  }
}
