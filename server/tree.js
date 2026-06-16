class Tree {
  constructor(id, x, groundY) {
    this.id = id;
    this.x = x;
    this.y = groundY;
    this.height = 160 + Math.random() * 100;
    this.canopyWidth = 90 + Math.random() * 50;
  }

  getBerryPosition() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * this.canopyWidth * 0.35;
    return {
      x: this.x + Math.cos(angle) * dist,
      y: this.y - this.height * (0.3 + Math.random() * 0.45),
    };
  }
}

module.exports = Tree;
