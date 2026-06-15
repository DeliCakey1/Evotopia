const { EVOLUTION_TIERS, MAP_WIDTH, MAP_HEIGHT } = require('./config');

let nextId = 1;

class Player {
  constructor(name) {
    this.id = nextId++;
    this.name = name || 'Player ' + this.id;
    this.x = Math.random() * (MAP_WIDTH - 200) + 100;
    this.y = Math.random() * (MAP_HEIGHT - 200) + 100;
    this.tier = 0;
    this.size = EVOLUTION_TIERS[0].size;
    this.speed = EVOLUTION_TIERS[0].speed;
    this.tierName = EVOLUTION_TIERS[0].name;
    this.color = EVOLUTION_TIERS[0].color;
    this.xp = 0;
    this.xpToNext = EVOLUTION_TIERS[0].xpToNext;
    this.targetX = this.x;
    this.targetY = this.y;
    this.angle = 0;
    this.alive = true;
    this.lastEvolveTier = -1;
  }

  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  update() {
    if (!this.alive) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      this.angle = Math.atan2(dy, dx);
      const move = Math.min(this.speed, dist);
      this.x += (dx / dist) * move;
      this.y += (dy / dist) * move;
    }

    this.x = Math.max(this.size, Math.min(MAP_WIDTH - this.size, this.x));
    this.y = Math.max(this.size, Math.min(MAP_HEIGHT - this.size, this.y));
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
      this.speed = t.speed;
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
      angle: this.angle,
      xp: this.xp,
      xpToNext: this.xpToNext,
      alive: this.alive,
    };
  }
}

module.exports = Player;
