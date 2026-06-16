class Input {
  constructor() {
    this.keys = {};
    this.dx = 0;
    this.dy = 0;
    this.lastDx = 0;
    this.lastDy = 0;
    this.lastLift = false;

    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      this.updateDirection();
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      this.updateDirection();
    });

    window.addEventListener('blur', () => {
      this.keys = {};
      this.dx = 0;
      this.dy = 0;
    });
  }

  get lift() {
    return !!(this.keys['w'] || this.keys['W'] || this.keys['ArrowUp']);
  }

  updateDirection() {
    this.dx = 0;
    this.dy = 0;
    if (this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) this.dy = 1;
    if (this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']) this.dx = -1;
    if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) this.dx = 1;
  }

  shouldSend() {
    return this.dx !== this.lastDx || this.dy !== this.lastDy || this.lift !== this.lastLift;
  }

  markSent() {
    this.lastDx = this.dx;
    this.lastDy = this.dy;
    this.lastLift = this.lift;
  }
}
