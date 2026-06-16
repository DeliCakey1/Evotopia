class Bush {
  constructor(id, x, groundY) {
    this.id = id;
    this.x = x;
    this.y = groundY;
    this.maxSeeds = 3 + Math.floor(Math.random() * 4);
    this.activeSeeds = 0;
    this.respawnTimers = [];
  }

  getSeedPosition() {
    return {
      x: this.x + (Math.random() - 0.5) * 30,
      y: this.y - 2 - Math.random() * 8,
    };
  }

  seedEaten() {
    this.activeSeeds--;
    this.respawnTimers.push(250 + Math.floor(Math.random() * 250));
  }

  update() {
    let ready = 0;
    for (let i = this.respawnTimers.length - 1; i >= 0; i--) {
      this.respawnTimers[i]--;
      if (this.respawnTimers[i] <= 0) {
        this.respawnTimers.splice(i, 1);
        ready++;
      }
    }
    return ready;
  }

  canAddSeed() {
    return this.activeSeeds < this.maxSeeds;
  }

  addSeed() {
    this.activeSeeds++;
  }
}

module.exports = Bush;
