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
    this.dx = 0;
    this.dy = 0;
    this.facingRight = true;
    this.alive = true;
  }

  setDirection(dx, dy) {
    this.dx = Math.max(-1, Math.min(1, dx));
    this.dy = Math.max(-1, Math.min(1, dy));
    if (dx !== 0) this.facingRight = dx > 0;
  }

  update() {
    if (!this.alive) return;

    if (this.dx !== 0 || this.dy !== 0) {
      const len = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      this.x += (this.dx / len) * this.speed;
      this.y += (this.dy / len) * this.speed;
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
      facingRight: this.facingRight,
      xp: this.xp,
      xpToNext: this.xpToNext,
      alive: this.alive,
    };
  }
}

module.exports = Player;
