const { EVOLUTION_TIERS, MAP_WIDTH, MAP_HEIGHT, GRAVITY, FLAP_VELOCITY, THRUST, DIVE_SPEED, DRAG } = require('./config');

function getTerrainY(x, mapHeight, waterZones) {
  const groundY = mapHeight - 200;
  let y = groundY - Math.sin(x * 0.012) * 12 - Math.sin(x * 0.025) * 5 - Math.sin(x * 0.04) * 3;
  for (const z of waterZones) {
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

let nextId = 1;

class Player {
  constructor(name) {
    this.id = nextId++;
    this.name = name || 'Player ' + this.id;
    this.x = Math.random() * (MAP_WIDTH - 200) + 100;
    this.y = Math.random() * (MAP_HEIGHT - 400) + 200;
    this.tier = 0;
    this.size = EVOLUTION_TIERS[0].size;
    this.maxSpeed = EVOLUTION_TIERS[0].speed;
    this.tierName = EVOLUTION_TIERS[0].name;
    this.color = EVOLUTION_TIERS[0].color;
    this.xp = 0;
    this.xpToNext = EVOLUTION_TIERS[0].xpToNext;
    this.dx = 0;
    this.dy = 0;
    this.vx = 0;
    this.vy = 0;
    this.facingRight = true;
    this.alive = true;
  }

  setDirection(dx, dy) {
    this.dx = Math.max(-1, Math.min(1, dx));
    this.dy = Math.max(-1, Math.min(1, dy));
    if (dx !== 0) this.facingRight = dx > 0;
  }

  canEat(food) {
    const tier = EVOLUTION_TIERS[this.tier];
    if (!tier.eats) return true;
    return tier.eats.includes(food.type);
  }

  canEatPlayer(other) {
    return this.tier > other.tier;
  }

  loseXp(amount) {
    this.xp = Math.max(0, this.xp - amount);
  }

  flap() {
    this.vy = -FLAP_VELOCITY;
  }

  update(waterZones) {
    if (!this.alive) return;

    if (this.dx !== 0) {
      this.vx += this.dx * THRUST;
    }

    if (this.dy > 0) {
      this.vy += DIVE_SPEED;
    }

    this.vy += GRAVITY;

    this.vx *= DRAG;
    this.vy *= DRAG;

    this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vx));
    this.vy = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vy));

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < this.size) { this.x = this.size; this.vx = 0; }
    if (this.x > MAP_WIDTH - this.size) { this.x = MAP_WIDTH - this.size; this.vx = 0; }
    if (this.y < this.size) { this.y = this.size; this.vy = 0; }

    const terrainY = getTerrainY(this.x, MAP_HEIGHT, waterZones);
    if (this.y + this.size > terrainY) {
      this.y = terrainY - this.size;
      this.vy = 0;
    }

    if (this.y > MAP_HEIGHT - this.size) { this.y = MAP_HEIGHT - this.size; this.vy = 0; }
  }

  addXp(amount) {
    this.xp += amount;
    let evolved = false;
    while (this.tier < EVOLUTION_TIERS.length - 1 && this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.tier++;
      const t = EVOLUTION_TIERS[this.tier];
      this.tierName = t.name;
      this.size = t.size;
      this.maxSpeed = t.speed;
      this.color = t.color;
      this.xpToNext = t.xpToNext;
      evolved = true;
    }
    return evolved ? this.tier : -1;
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      x: Math.round(this.x * 10) / 10,
      y: Math.round(this.y * 10) / 10,
      size: this.size,
      tier: this.tier,
      tierName: this.tierName,
      color: this.color,
      facingRight: this.facingRight,
      xp: this.xp,
      xpToNext: this.xpToNext,
      alive: this.alive,
    };
  }
}

module.exports = Player;
