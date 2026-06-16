class Input {
  constructor() {
    this.keys = {};
    this.dx = 0;
    this.dy = 0;
    this.flap = false;
    this.lastDx = 0;
    this.lastDy = 0;

    document.addEventListener('keydown', (e) => {
      const key = e.key;
      if (!e.repeat && (key === 'w' || key === 'W' || key === 'ArrowUp')) {
        this.flap = true;
      }
      this.keys[key] = true;
      this.updateDirection();
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
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

  updateDirection() {
    this.dx = 0;
    this.dy = 0;
    if (this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) this.dy = 1;
    if (this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']) this.dx = -1;
    if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) this.dx = 1;
  }

  shouldSend() {
    return this.dx !== this.lastDx || this.dy !== this.lastDy || this.flap;
  }

  markSent() {
    this.lastDx = this.dx;
    this.lastDy = this.dy;
    this.flap = false;
  }
}
