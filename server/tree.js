class Tree {
  constructor(id, x, groundY) {
    this.id = id;
    this.x = x;
    this.y = groundY;
    this.height = 160 + Math.random() * 100;
    this.canopyWidth = 90 + Math.random() * 50;
    this.maxCherries = 5 + Math.floor(Math.random() * 6);
    this.activeCherries = 0;
    this.respawnTimers = [];
  }

  getBerryPosition() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * this.canopyWidth * 0.35;
    return {
      x: this.x + Math.cos(angle) * dist,
      y: this.y - this.height * (0.3 + Math.random() * 0.45),
    };
  }

  cherryEaten() {
    this.activeCherries--;
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

  canAddCherry() {
    return this.activeCherries < this.maxCherries;
  }

  addCherry() {
    this.activeCherries++;
  }
}

module.exports = Tree;
