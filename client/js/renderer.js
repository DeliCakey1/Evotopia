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
    this.groundTrees = [];
    this.initClouds();
    this.initGround();
  }

  initClouds() {
    for (let i = 0; i < 35; i++) {
      this.clouds.push({
        x: Math.random() * 6500 - 250,
        y: 100 + Math.random() * 1800,
        w: 70 + Math.random() * 140,
        h: 18 + Math.random() * 30,
        speed: 0.08 + Math.random() * 0.18,
        opacity: 0.2 + Math.random() * 0.3,
      });
    }
  }

  initGround() {
    for (let i = 0; i < 80; i++) {
      this.groundTrees.push({
        x: Math.random() * 6500 - 250,
        h: 18 + Math.random() * 25,
        w: 10 + Math.random() * 8,
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
      for (const p of state.players) {
        this.drawPlayer(ctx, p, p.id === myId);
      }
    }

    ctx.restore();
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

    for (const c of this.clouds) {
      c.x += c.speed;
      if (c.x > 6500) c.x = -250;

      const a = c.opacity * fade;
      if (a < 0.01) continue;
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffffff';

      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w * 0.4, c.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(c.x - c.w * 0.3, c.y + c.h * 0.1, c.w * 0.35, c.h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(c.x + c.w * 0.25, c.y + c.h * 0.05, c.w * 0.3, c.h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(c.x - c.w * 0.1, c.y - c.h * 0.15, c.w * 0.25, c.h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
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

    for (const t of this.groundTrees) {
      const baseY = groundY - 3 - Math.sin(t.x * 0.012) * 12 - Math.sin(t.x * 0.025) * 5 - Math.sin(t.x * 0.04) * 3;
      ctx.fillStyle = 'rgba(30,70,20,0.25)';
      ctx.fillRect(t.x - 2, baseY - t.h * 0.5, 4, t.h * 0.5);
      ctx.beginPath();
      ctx.moveTo(t.x, baseY - t.h * 0.5);
      ctx.lineTo(t.x - t.w * 0.5, baseY - t.h * 0.15);
      ctx.lineTo(t.x + t.w * 0.5, baseY - t.h * 0.15);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(t.x, baseY - t.h * 0.7);
      ctx.lineTo(t.x - t.w * 0.35, baseY - t.h * 0.3);
      ctx.lineTo(t.x + t.w * 0.35, baseY - t.h * 0.3);
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
      const a = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  drawPlayer(ctx, p, isMe) {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (!p.facingRight) ctx.scale(-1, 1);
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
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(s * 0.4, -s * 0.1); ctx.lineTo(s * 0.8, -s * 0.15); ctx.lineTo(s * 0.4, -s * 0.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(s * 0.4, s * 0.1); ctx.lineTo(s * 0.8, s * 0.15); ctx.lineTo(s * 0.4, s * 0.5); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-s * 0.3, 0); ctx.lineTo(-s * 0.8, s * 0.15); ctx.lineTo(-s * 0.7, -s * 0.1); ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.moveTo(s * 0.3, -s * 0.05); ctx.lineTo(s * 0.6, -s * 0.08); ctx.lineTo(s * 0.3, s * 0.05); ctx.fill();
  }

  drawCrow(ctx, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(s * 0.35, -s * 0.25); ctx.lineTo(s * 0.3, -s * 0.7); ctx.lineTo(s * 0.55, -s * 0.3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(s * 0.35, s * 0.25); ctx.lineTo(s * 0.3, s * 0.7); ctx.lineTo(s * 0.55, s * 0.3); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-s * 0.35, 0); ctx.lineTo(-s * 0.75, s * 0.08); ctx.lineTo(-s * 0.7, -s * 0.15); ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.moveTo(s * 0.35, -s * 0.08); ctx.lineTo(s * 0.65, -s * 0.1); ctx.lineTo(s * 0.3, s * 0.05); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(s * 0.2, -s * 0.15, s * 0.08, 0, Math.PI * 2); ctx.fill();
  }

  drawHawk(ctx, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this.darken(color, 0.8);
    ctx.beginPath(); ctx.moveTo(s * 0.15, -s * 0.2); ctx.lineTo(-s * 0.1, -s * 0.75); ctx.lineTo(s * 0.4, -s * 0.35); ctx.fill();
    ctx.beginPath(); ctx.moveTo(s * 0.15, s * 0.2); ctx.lineTo(-s * 0.1, s * 0.75); ctx.lineTo(s * 0.4, s * 0.35); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-s * 0.35, 0); ctx.lineTo(-s * 0.75, s * 0.1); ctx.lineTo(-s * 0.65, -s * 0.15); ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.moveTo(s * 0.35, -s * 0.05); ctx.lineTo(s * 0.7, -s * 0.08); ctx.lineTo(s * 0.35, s * 0.05); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(s * 0.2, -s * 0.12, s * 0.07, 0, Math.PI * 2); ctx.fill();
  }

  drawEagle(ctx, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.38, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this.darken(color, 0.8);
    ctx.beginPath(); ctx.moveTo(s * 0.1, -s * 0.2); ctx.lineTo(-s * 0.2, -s * 0.85); ctx.lineTo(s * 0.45, -s * 0.35); ctx.fill();
    ctx.beginPath(); ctx.moveTo(s * 0.1, s * 0.2); ctx.lineTo(-s * 0.2, s * 0.85); ctx.lineTo(s * 0.45, s * 0.35); ctx.fill();
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath(); ctx.moveTo(s * 0.2, -s * 0.05); ctx.lineTo(s * 0.7, -s * 0.1); ctx.lineTo(s * 0.4, 0); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-s * 0.4, 0); ctx.lineTo(-s * 0.8, s * 0.12); ctx.lineTo(-s * 0.7, -s * 0.12); ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.moveTo(s * 0.35, -s * 0.06); ctx.lineTo(s * 0.72, -s * 0.1); ctx.lineTo(s * 0.35, s * 0.06); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(s * 0.18, -s * 0.14, s * 0.08, 0, Math.PI * 2); ctx.fill();
  }

  drawPhoenix(ctx, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.38, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF9944';
    ctx.beginPath(); ctx.moveTo(s * 0.2, -s * 0.25); ctx.lineTo(-s * 0.1, -s * 0.85); ctx.lineTo(s * 0.45, -s * 0.3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(s * 0.2, s * 0.25); ctx.lineTo(-s * 0.1, s * 0.85); ctx.lineTo(s * 0.45, s * 0.3); ctx.fill();
    for (let i = 0; i < 3; i++) {
      const ty = -s * 0.35 - i * s * 0.15;
      ctx.fillStyle = i % 2 === 0 ? '#FF6633' : '#FFD700';
      ctx.beginPath(); ctx.moveTo(s * 0.1, ty); ctx.lineTo(-s * 0.45, ty - s * 0.1); ctx.lineTo(-s * 0.35, ty + s * 0.05); ctx.fill();
    }
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.moveTo(-s * 0.4, 0); ctx.lineTo(-s * 0.9, s * 0.15); ctx.lineTo(-s * 0.75, -s * 0.05); ctx.lineTo(-s * 0.9, -s * 0.2); ctx.fill();
    for (let i = 0; i < 4; i++) {
      const ty = s * 0.3 + i * s * 0.25;
      ctx.fillStyle = i % 2 === 0 ? '#FF6633' : '#FFD700';
      ctx.beginPath(); ctx.moveTo(-s * 0.2, ty); ctx.quadraticCurveTo(-s * 0.6, ty + s * 0.15, -s * 0.3, ty + s * 0.3); ctx.quadraticCurveTo(-s * 0.1, ty + s * 0.1, -s * 0.2, ty); ctx.fill();
    }
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.moveTo(s * 0.4, -s * 0.1); ctx.lineTo(s * 0.8, -s * 0.05); ctx.lineTo(s * 0.4, s * 0.1); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s * 0.2, -s * 0.15, s * 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.moveTo(s * 0.05, -s * 0.45); ctx.lineTo(s * 0.15, -s * 0.65); ctx.lineTo(s * 0.25, -s * 0.45); ctx.fill();
  }

  drawDragon(ctx, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.38, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this.darken(color, 0.75);
    ctx.beginPath(); ctx.moveTo(-s * 0.1, -s * 0.15); ctx.lineTo(-s * 0.4, -s * 0.85); ctx.lineTo(s * 0.25, -s * 0.35); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-s * 0.1, s * 0.15); ctx.lineTo(-s * 0.4, s * 0.85); ctx.lineTo(s * 0.25, s * 0.35); ctx.closePath(); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-s * 0.45, 0); ctx.lineTo(-s * 0.9, s * 0.15); ctx.lineTo(-s * 0.8, -s * 0.05); ctx.lineTo(-s * 0.9, -s * 0.2); ctx.fill();
    for (let i = 0; i < 3; i++) {
      const ty = s * 0.3 + i * s * 0.2;
      ctx.fillStyle = this.darken(color, 0.7);
      ctx.beginPath(); ctx.moveTo(-s * 0.15, ty); ctx.lineTo(-s * 0.5, ty - s * 0.05); ctx.lineTo(-s * 0.4, ty + s * 0.15); ctx.lineTo(-s * 0.15, ty + s * 0.05); ctx.fill();
    }
    ctx.fillStyle = '#66FF66';
    ctx.beginPath(); ctx.arc(s * 0.15, -s * 0.15, s * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(s * 0.15, -s * 0.15, s * 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#66FF66';
    ctx.beginPath(); ctx.arc(s * 0.1, -s * 0.25, s * 0.03, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this.darken(color, 0.6);
    ctx.beginPath(); ctx.moveTo(-s * 0.1, -s * 0.45); ctx.lineTo(s * 0.05, -s * 0.6); ctx.lineTo(s * 0.15, -s * 0.4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(s * 0.0, -s * 0.5); ctx.lineTo(s * 0.05, -s * 0.7); ctx.lineTo(s * 0.2, -s * 0.45); ctx.fill();
    ctx.fillStyle = '#FF4444';
    ctx.beginPath(); ctx.moveTo(s * 0.4, -s * 0.08); ctx.lineTo(s * 0.75, -s * 0.02); ctx.lineTo(s * 0.4, s * 0.08); ctx.fill();
  }

  darken(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 'rgb(' + Math.floor(r * factor) + ',' + Math.floor(g * factor) + ',' + Math.floor(b * factor) + ')';
  }
}
